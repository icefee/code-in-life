import React, { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import LoadingOverlay from '../loading/LoadingOverlay';
import { M3u8 } from '../../util/RegExp';

type M3u8UrlParserProps = {
    url: string;
    children: (url: string) => React.ReactElement;
}

const parseUrl = async (url: string) => {
    try {
        const { code, data } = await fetch('/api/video/parse?url=' + url).then<{
            code: number;
            data: string;
        }>(
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

function M3u8UrlParser({ url, children }: M3u8UrlParserProps) {

    const [m3u8Url, setM3u8Url] = useState(null)
    const [error, setError] = useState(false)
    const isM3u8 = useMemo(() => M3u8.isM3u8Url(url), [url])

    const _parseUrl = async () => {
        const m3u8Url = await parseUrl(url)
        if (m3u8Url) {
            setM3u8Url(m3u8Url)
        }
        else {
            setError(true)
        }
    }

    useEffect(() => {
        if (!isM3u8) {
            setM3u8Url(null)
            _parseUrl()
        }
    }, [url])

    if (isM3u8) {
        return children(url)
    }
    return (
        <Box sx={{
            position: 'relative',
            height: '100%'
        }}>
            {
                m3u8Url && children(m3u8Url)
            }
            <LoadingOverlay
                open={m3u8Url === null && !error}
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

M3u8UrlParser.parseUrl = parseUrl;

export default M3u8UrlParser;
