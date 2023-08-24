import React, { useState, useEffect, useMemo, useRef } from 'react'
import Fade from '@mui/material/Fade'
import Popover from '@mui/material/Popover'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

interface Lrc {
    time: number;
    text: string;
}

interface MusicLrcProps {
    id: SearchMusic['id'];
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
    const lrcCache = useRef(new Map<MusicLrcProps['id'], Lrc[]>())
    const [anchorEl, setAnchorEl] = useState<HTMLSpanElement | null>(null)
    const downloadingPlaceholder = '正在下载歌词..'
    const emptyPlaceholder = '🎵🎵...'

    const [show, setShow] = useState(false)

    const handleClose = () => {
        setAnchorEl(null)
    }

    const getLrc = async (id: MusicLrcProps['id']) => {
        if (lrcCache.current.has(id)) {
            setLrc(lrcCache.current.get(id))
        }
        else {
            setDownloading(true)
            const data = await downloadLrc(id)
            setLrc(data ?? [])
            if (data) {
                lrcCache.current.set(id, data)
            }
            setDownloading(false)
        }
    }

    useEffect(() => {
        getLrc(id)
    }, [id])

    const lineIndex = useMemo(() => {
        const index = lrc.findIndex(
            ({ time }) => time > currentTime
        )
        return index > -1 ? index - 1 : lrc.length - 1;
    }, [lrc, currentTime])

    const lineActive = useMemo(() => lrc.length > 0 && lineIndex !== -1, [lrc, lineIndex])

    const lrcLine = useMemo(() => {
        if (downloading) {
            return downloadingPlaceholder
        }
        if (lineActive) {
            return lrc[lineIndex].text
        }
        return '';
    }, [downloading, lineActive, lrc, lineIndex])

    const lineDuration = useMemo(() => {
        if (lineActive && lineIndex < lrc.length - 1) {
            return lrc[lineIndex + 1].time - lrc[lineIndex].time
        }
        return 0
    }, [lineActive, lrc, lineIndex])

    const placeholder = (text: string) => (
        <Box sx={{
            p: 2
        }}>
            <Typography variant="subtitle2">{text}</Typography>
        </Box>
    )

    const displayLrc = useMemo(() => {
        if (lrcLine.trim().length > 0) {
            return lrcLine;
        }
        return emptyPlaceholder;
    }, [lrcLine])

    useEffect(() => {
        setShow(true)
        return () => {
            setShow(false)
        }
    }, [displayLrc])

    return (
        <>
            <Stack
                direction="row"
                justifyContent="flex-end"
            >
                <Typography
                    variant="caption"
                    noWrap
                    sx={{
                        display: 'block',
                        cursor: 'pointer'
                    }}
                    onClick={
                        (event: React.MouseEvent<HTMLDivElement>) => {
                            setAnchorEl(event.currentTarget);
                        }
                    }
                    title={displayLrc}
                >
                    {
                        displayLrc.split('').map(
                            (text, index, chars) => {
                                const totalDelay = Math.max(lineDuration, 3) * 1000
                                const delay = (totalDelay / chars.length / 2) * index
                                return (
                                    <Fade
                                        key={lineIndex + '-' + index}
                                        in={show}
                                        timeout={Math.min(totalDelay / 2, 800)}
                                        style={{
                                            transitionDelay: delay + 'ms'
                                        }}
                                        unmountOnExit
                                    >
                                        <span>{text}</span>
                                    </Fade>
                                )
                            }
                        )
                    }
                </Typography>
            </Stack>
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
                slotProps={{
                    paper: {
                        sx: {
                            backgroundImage: 'none'
                        }
                    }
                }}
                disablePortal
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
        <Box sx={(theme) => ({
            height: '40vh',
            maxHeight: 400,
            minWidth: 240,
            maxWidth: 'var(--max-width)',
            [theme.breakpoints.only('xs')]: {
                maxWidth: '75vw'
            }
        })}>
            <Box sx={(theme) => ({
                position: 'relative',
                height: '100%',
                overflow: 'hidden',
                px: 2,
                py: 1,
                '--color-line-gradient': `transparent, ${theme.palette.background.paper}`,
                '&::before': {
                    content: '""',
                    background: 'linear-gradient(0deg, var(--color-line-gradient))',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    right: 0,
                    height: 120,
                    zIndex: 2
                },
                '&::after': {
                    content: '""',
                    background: 'linear-gradient(180deg, var(--color-line-gradient))',
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    right: 0,
                    height: 120,
                    zIndex: 2
                }
            })}>
                <Box sx={{
                    transition: (theme) => theme.transitions.create('transform'),
                    transform: `translate(0, calc(20vh - 24px - ${28 * activeIndex}px))`
                }}>
                    {
                        lrc.map(
                            ({ text }, index) => {
                                const isActive = activeIndex === index;
                                return (
                                    <Stack sx={{
                                        height: 28,
                                        color: isActive ? 'secondary.main' : 'text.primary'
                                    }} justifyContent="center" key={index}>
                                        <Typography
                                            variant="subtitle2"
                                            color="inherit"
                                            textOverflow="ellipsis"
                                            textAlign="center"
                                            title={text}
                                            noWrap
                                        >{text}</Typography>
                                    </Stack>
                                )
                            }
                        )
                    }
                </Box>
            </Box>
        </Box>
    )
}

export default MusicLrc;
