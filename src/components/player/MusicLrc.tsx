import React, { useState, useEffect, useMemo, useRef } from 'react'
import Fade from '@mui/material/Fade'
import Popover from '@mui/material/Popover'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { getJson } from '~/util/proxy'
import { isIos } from '~/util/env'

interface MusicLrcProps extends Pick<SearchMusic, 'id'> {
    currentTime: number;
}

async function downloadLrc(id: SearchMusic['id']): Promise<Lrc[] | null> {
    try {
        const { code, data } = await getJson<ApiJsonType<Lrc[]>>(`/api/music/lrc/${id}`)
        if (code === 0) {
            return data
        }
        else {
            throw new Error('download lrc failed.')
        }
    }
    catch (err) {
        return null
    }
}

function MusicLrc({ id, currentTime }: MusicLrcProps) {

    const [downloading, setDownloading] = useState(false)
    const [lrc, setLrc] = useState<Lrc[]>([])
    const lrcCache = useRef<Map<SearchMusic['id'], Lrc[]>>(new Map())
    const [anchorEl, setAnchorEl] = useState<HTMLSpanElement | null>(null)
    const downloadingPlaceholder = '正在下载歌词..'
    const emptyPlaceholder = '🎵🎵...'

    const [show, setShow] = useState(false)

    const handleClose = () => {
        setAnchorEl(null)
    }

    const getLrc = async (id: SearchMusic['id']) => {
        let data: Lrc[] | null = null
        if (lrcCache.current.has(id)) {
            data = lrcCache.current.get(id)
        }
        else {
            data = await downloadLrc(id)
            if (data) {
                lrcCache.current.set(id, data)
            }
        }
        return {
            id,
            data
        }
    }

    useEffect(() => {
        setDownloading(true)
        getLrc(id).then(
            ({ data, id: rid }) => {
                if (id === rid) {
                    setLrc(data ?? [])
                }
            }
        ).finally(() => {
            setDownloading(false)
        })
    }, [id])

    const lineIndex = useMemo(() => {
        const index = lrc.findIndex(
            ({ time }) => time > currentTime
        )
        return index > -1 ? index - 1 : lrc.length - 1
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
        let duration = 1;
        if (lineActive && lineIndex < lrc.length - 1) {
            duration = lrc[lineIndex + 1].time - lrc[lineIndex].time
        }
        return Math.min(duration, 3)
    }, [lineActive, lrc, lineIndex])

    const linePlayedDuration = useMemo(() => {
        let timeStart = 0
        if (lineIndex > -1 && lrc.length > 0) {
            timeStart = lrc[lineIndex].time
        }
        return Math.min(currentTime - timeStart, 3)
    }, [lrc, lineIndex, currentTime])

    const placeholder = (text: string) => (
        <Box
            sx={{
                p: 2
            }}
        >
            <Typography variant="subtitle2">{text}</Typography>
        </Box>
    )

    const displayLrc = useMemo(() => {
        if (lrcLine.trim().length > 0) {
            return lrcLine
        }
        return emptyPlaceholder
    }, [lrcLine])

    useEffect(() => {
        setShow(true)
        return () => {
            setShow(false)
        }
    }, [displayLrc])

    useEffect(() => {
        if (typeof window !== 'undefined' && !isIos()) {
            window.CSS.registerProperty({
                name: '--line-played',
                syntax: '<number>',
                initialValue: '0',
                inherits: true
            })
        }
    }, [])

    return (
        <>
            <Stack
                direction="row"
                justifyContent="flex-end"
            >
                <div
                    style={{
                        position: 'relative',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        /** @ts-ignore */
                        '--line-played': Math.min(1, linePlayedDuration / lineDuration)
                    }}
                    onClick={
                        (event) => {
                            setAnchorEl(event.currentTarget)
                        }
                    }
                    title={displayLrc}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            display: 'block',
                            opacity: .75,
                            transition: 'all .4s linear',
                            maskImage: 'linear-gradient(0.25turn, transparent 0% calc(var(--line-played) * 100%), #000 calc(var(--line-played) * 100%) 100%)'
                        }}
                        noWrap
                    >
                        {
                            displayLrc.split(new RegExp('(?:)', 'u')).map(
                                (text, index, chars) => {
                                    const lineDurationMilliseconds = lineDuration * 1e3
                                    const delay = (lineDurationMilliseconds / chars.length) * index
                                    return (
                                        <Fade
                                            key={lineIndex + '-' + index}
                                            in={show}
                                            timeout={Math.min(lineDurationMilliseconds / 2, 800)}
                                            style={{
                                                transitionDelay: delay / 4 + 'ms'
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
                    <Typography
                        variant="caption"
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            transition: 'all .4s linear',
                            backgroundImage: 'linear-gradient(0, #ff9800, cyan)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            maskImage: 'linear-gradient(0.25turn, #000 0% calc(var(--line-played) * 100%), transparent calc(var(--line-played) * 100%) 100%)'
                        }}
                        noWrap
                    >{displayLrc}</Typography>
                </div>
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
        <Box
            sx={(theme) => ({
                height: '50vh',
                maxHeight: 600,
                minWidth: 240,
                maxWidth: 'var(--max-width)',
                [theme.breakpoints.only('xs')]: {
                    maxWidth: '75vw'
                }
            })}
        >
            <Box
                sx={{
                    height: '100%',
                    overflow: 'hidden',
                    px: 2,
                    py: 1,
                    maskImage: 'linear-gradient(transparent, rgb(0 0 0 / 15%) 20%, #000 40% 60%, rgb(0 0 0 / 15%) 80%, transparent)'
                }}
            >
                <Box
                    sx={{
                        transition: ({ transitions }) => transitions.create('transform'),
                        transform: `translate(0, calc(25vh - 24px - ${28 * activeIndex}px))`
                    }}
                >
                    {
                        lrc.map(
                            ({ text }, index) => (
                                <Stack
                                    sx={{
                                        height: 28,
                                        color: activeIndex === index ? 'secondary.main' : 'text.primary'
                                    }}
                                    justifyContent="center"
                                    key={index}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        color="inherit"
                                        textAlign="center"
                                        title={text}
                                        noWrap
                                    >{text}</Typography>
                                </Stack>
                            )
                        )
                    }
                </Box>
            </Box>
        </Box>
    )
}

export default MusicLrc