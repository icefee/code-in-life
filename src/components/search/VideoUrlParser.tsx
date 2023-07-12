import React, { useState, useEffect, useMemo } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Typography from '@mui/material/Typography'
import LoadingOverlay from '../loading/LoadingOverlay'
import { Video } from '../../util/regExp'

type VideoUrlParserProps = {
    url: string;
    children: (url: string) => React.ReactElement;
}

const parseUrl = async (url: string) => {
    try {
        const { code, data } = await fetch('/api/video/parse?url=' + url).then<ApiJsonType<string>>(
            response => response.json()
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

    const _parseUrl = async () => {
        const parsedUrl = await parseUrl(url)
        if (parsedUrl) {
            setVideoUrl(parsedUrl)
        }
        else {
            setError(true)
        }
    }

    useEffect(() => {
        if (!isVideoUrl) {
            setVideoUrl(null)
            _parseUrl()
        }
    }, [url])

    const encodeUrl = (url: string) => {
        return url // `/api/video/m3u8-parse?url=${url}`
    }

    if (isVideoUrl) {
        return children(encodeUrl(url))
    }
    return (
        <Box sx={{
            position: 'relative',
            height: '100%'
        }}>
            {
                videoUrl && children(encodeUrl(videoUrl))
            }
            <LoadingOverlay
                open={videoUrl === null && !error}
                spinSize={28}
                fixed={false}
                label="地址解析中"
                labelColor="#fff"
            />
            {
                error && (
                    <Alert severity="error" sx={
                        (theme) => ({
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            [theme.breakpoints.only('xs')]: {
                                width: '90%'
                            }
                        })
                    }>
                        <AlertTitle>解析失败</AlertTitle>
                        <Typography variant="caption" paragraph>第三方云播放地址解析失败, 请尝试用m3u8源观看或从源地址播放</Typography>
                        <Stack direction="row" justifyContent="flex-end" columnGap={1}>
                            <Button color="inherit" variant="outlined" size="small" onClick={
                                () => {
                                    setError(false);
                                    _parseUrl()
                                }
                            }>重试</Button>
                            <Button color="inherit" variant="outlined" size="small" sx={{
                                whiteSpace: 'nowrap'
                            }} onClick={
                                () => {
                                    window.open(url)
                                }
                            }>源地址播放</Button>
                        </Stack>
                    </Alert>
                )
            }
        </Box>
    )
}

VideoUrlParser.parseUrl = parseUrl;

export default VideoUrlParser;
