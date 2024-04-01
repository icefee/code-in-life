import React, { useState, useEffect, useMemo, useRef } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Typography from '@mui/material/Typography'
import LoadingOverlay from '../loading/LoadingOverlay'
import { Video, M3u8 } from '~/util/regExp'
import { Base64Params } from '~/util/clue'
import { getJson } from '~/util/proxy'

type VideoUrlParserProps = {
    url: string;
    children: (url: string, hls: boolean) => React.ReactElement;
}

const parseUrl = async (url: string) => {
    try {
        const token = Base64Params.create(url)
        const { code, data } = await getJson<ApiJsonType<string>>(
            `/api/video/parse/${token}`
        )
        if (code === 0) {
            return data;
        }
        throw new Error('url parse fail.')
    }
    catch (err) {
        return null;
    }
}

function VideoUrlParser({ url, children }: VideoUrlParserProps) {

    const [videoUrl, setVideoUrl] = useState(null)
    const [error, setError] = useState(false)
    const isVideoUrl = useMemo(() => Video.isVideoUrl(url), [url])
    const parseRetryTimes = useRef(0)

    const _parseUrl = async () => {
        const parsedUrl = await parseUrl(url)
        if (parsedUrl) {
            setVideoUrl(parsedUrl)
        }
        else if (parseRetryTimes.current < 3) {
            parseRetryTimes.current++
            _parseUrl()
        }
        else {
            setError(true)
        }
    }

    const _isHls = (url: string) => M3u8.isM3u8Url(url)

    useEffect(() => {
        if (!isVideoUrl) {
            _parseUrl()
        }
        return () => {
            if (!isVideoUrl) {
                setError(false)
                setVideoUrl(null)
            }
        }
    }, [url])

    if (isVideoUrl) {
        return children(url, _isHls(url))
    }
    return (
        <Box
            sx={{
                position: 'relative',
                height: '100%'
            }}
        >
            {
                videoUrl && children(videoUrl, _isHls(videoUrl))
            }
            <LoadingOverlay
                open={videoUrl === null && !error}
                spinnerSize={28}
                fixed={false}
                label="地址解析中.."
            />
            {
                error && (
                    <Alert
                        severity="error"
                        sx={
                            ({ breakpoints }) => ({
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                                [breakpoints.only('xs')]: {
                                    width: '90%'
                                }
                            })
                        }
                    >
                        <AlertTitle>解析失败</AlertTitle>
                        <Typography
                            variant="caption"
                            paragraph
                        >第三方云播放地址解析失败, 请尝试用m3u8源观看或从源地址播放</Typography>
                        <Stack
                            direction="row"
                            justifyContent="flex-end"
                            columnGap={1}
                        >
                            <Button
                                color="inherit"
                                variant="outlined"
                                size="small"
                                onClick={
                                    () => {
                                        setError(false)
                                        _parseUrl()
                                    }
                                }
                            >重试</Button>
                            <Button
                                color="inherit"
                                variant="outlined"
                                size="small"
                                href={url}
                                target="_blank"
                            >源地址播放</Button>
                        </Stack>
                    </Alert>
                )
            }
        </Box>
    )
}

VideoUrlParser.parseUrl = parseUrl

export default VideoUrlParser