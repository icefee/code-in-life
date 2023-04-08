import React, { useState, useEffect, useMemo, useRef } from 'react';
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface Lrc {
    time: number;
    text: string;
}

interface MusicLrcProps {
    id: number;
    currentTime: number;
}

async function downloadLrc(id: MusicLrcProps['id']): Promise<Lrc[] | null> {
    try {
        const { code, data } = await fetch(`/api/music/lrc/${id}`).then<ApiJsonType<Lrc[]>>(
            response => response.json()
        )
        if (code === 0) {
            return data;
        }
        else {
            throw new Error('download lrc failed.')
        }
    }
    catch (err) {
        return null;
    }
}

function MusicLrc({ id, currentTime }: MusicLrcProps) {

    const [lrc, setLrc] = useState<Lrc[]>([])
    const [downloading, setDownloading] = useState(false)
    const lrcCache = useRef(new Map<number, Lrc[]>())
    const [anchorEl, setAnchorEl] = useState<HTMLSpanElement | null>(null);

    const handleClose = () => {
        setAnchorEl(null);
    }

    const getLrc = async (id: MusicLrcProps['id']) => {
        if (lrcCache.current.has(id)) {
            setLrc(lrcCache.current.get(id))
        }
        else {
            setDownloading(true)
            const data = await downloadLrc(id)
            if (data) {
                setLrc(data)
                lrcCache.current.set(id, data)
            }
            setDownloading(false)
        }
    }

    useEffect(() => {
        getLrc(id)
    }, [id])

    const downloadingPlaceholder = '正在下载歌词..';

    const lrcLine = useMemo(() => {
        if (downloading) {
            return downloadingPlaceholder
        }
        const playedLines = lrc.filter(
            ({ time }) => time <= currentTime
        )
        if (playedLines.length > 0) {
            return playedLines[playedLines.length - 1].text
        }
        return '🎵🎵...';
    }, [downloading, lrc, currentTime])

    const placeholder = (text: string) => (
        <Box sx={{
            p: 2
        }}>
            <Typography variant="subtitle2">{text}</Typography>
        </Box>
    )

    return (
        <>
            <Box sx={{
                p: 1,
                cursor: 'pointer'
            }} onClick={
                (event: React.MouseEvent<HTMLDivElement>) => {
                    setAnchorEl(event.currentTarget);
                }
            }>
                <Typography variant="caption" display="block" maxWidth={250} noWrap>{lrcLine}</Typography>
            </Box>
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        backgroundImage: 'none'
                    }
                }}
                marginThreshold={32}
            >
                {
                    downloading ? placeholder(downloadingPlaceholder) : lrc.length > 0 ? (
                        <ScrollingLrc
                            lrc={lrc}
                            currentTime={currentTime}
                        />
                    ) : placeholder('暂无可用歌词')
                }
            </Popover>
        </>
    )
}

interface ScrollingLrcProps extends Pick<MusicLrcProps, 'currentTime'> {
    lrc: Lrc[];
}

function ScrollingLrc({ lrc, currentTime }: ScrollingLrcProps) {

    const activeIndex = useMemo(() => {
        const matchIndex = lrc.findIndex(
            l => l.time > currentTime
        )
        if (matchIndex > -1) {
            return matchIndex - 1
        }
        return lrc.length - 1;
    }, [lrc, currentTime])

    return (
        <Box sx={{
            height: '40vh',
            maxHeight: 400,
            maxWidth: 'var(--max-width)',
            px: 3,
            py: 2
        }}>
            <Box sx={{
                position: 'relative',
                height: '100%',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    background: (theme) => `linear-gradient(0deg, transparent, ${theme.palette.background.paper})`,
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    right: 0,
                    height: 96,
                    zIndex: 2
                },
                '&::after': {
                    content: '""',
                    background: (theme) => `linear-gradient(0deg, ${theme.palette.background.paper}, transparent)`,
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    right: 0,
                    height: 96,
                    zIndex: 2
                }
            }}>
                <Box sx={{
                    transition: (theme) => theme.transitions.create('transform'),
                    transform: `translate(0, calc(20vh - 24px - ${28 * activeIndex}px))`
                }}>
                    {
                        lrc.map(
                            ({ text }, index) => (
                                <Stack sx={{
                                    height: 28,
                                    color: activeIndex === index ? 'primary.main' : 'text.primary'
                                }} alignItems="center" justifyContent="center" key={index}>
                                    <Typography variant="subtitle2" color="inherit" textOverflow="ellipsis" noWrap>{text}</Typography>
                                </Stack>
                            )
                        )
                    }
                </Box>
            </Box>
        </Box>
    )
}

export default MusicLrc;
