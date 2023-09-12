import React, { useState, useEffect, useRef } from 'react'
import type { GetServerDataProps, GetServerDataReturn, PageProps } from 'gatsby'
import NoSsr from '@mui/material/NoSsr'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Hls2Mp4 from 'hls2mp4'
import useErrorMessage from '~/components/hook/useErrorMessage'

export function Head() {
    return (
        <>
            <title key="hls-download">hls视频下载</title>
        </>
    )
}

interface ServerProps {
    url: string | null;
}

export async function getServerData({ query }: GetServerDataProps): Promise<GetServerDataReturn<ServerProps>> {
    const { url = null } = query as Record<'url', string>;
    return {
        props: {
            url
        }
    }
}

function HlsDownload({ serverData }: PageProps<object, object, unknown, ServerProps>) {

    const { url } = serverData
    const [input, setInput] = useState(url ?? '')
    const [busy, setBusy] = useState(false)
    const hls2Mp4 = useRef<Hls2Mp4 | null>(null)
    const [status, setStatus] = useState('')
    const [downloading, setDownloading] = useState(false)
    const [progress, setProgress] = useState(0)

    const { showErrorMessage: showError, hideAll } = useErrorMessage()
    const urlMatchRegExp = new RegExp('^https?://[\\w\\u4e00-\\u9fa5-./@%?:]+?\\.m3u8$', 'i')

    const getFileName = (url: string) => {
        const fileNameMatch = url.match(/[^\/]+$/)
        return fileNameMatch ? fileNameMatch[0].replace(/\.m3u8$/, '') : `${+new Date()}`
    }

    const testUrl = async (url: string) => {
        try {
            const response = await fetch(url)
            const contentType = response.headers.get('content-type')
            return /application\/vnd.apple.mpegURL/i.test(contentType)
        }
        catch (err) {
            return false
        }
    }

    const startDownload = async () => {
        try {
            if (urlMatchRegExp.test(input)) {
                setBusy(true)
                setStatus('检测hls地址..')
                const payloadValid = await testUrl(input)
                if (payloadValid) {
                    const buffer = await hls2Mp4.current.download(input)
                    const fileName = getFileName(input)
                    hls2Mp4.current.saveToFile(buffer, `${fileName}.mp4`)
                    setBusy(false)
                }
                else {
                    throw new Error('非法的hls内容')
                }
            }
            else {
                throw new Error('非法的hls地址')
            }
        }
        catch (err) {
            showError({
                message: String(err)
            })
            setTimeout(
                () => {
                    setBusy(false)
                    hideAll()
                },
                1e3
            )
        }
    }

    useEffect(() => {
        hls2Mp4.current = new Hls2Mp4({
            maxRetry: 5,
            tsDownloadConcurrency: 20
        }, (type, progress) => {
            const TaskType = Hls2Mp4.TaskType;
            if (type === TaskType.loadFFmeg) {
                if (progress === 0) {
                    setStatus('加载FFmpeg..')
                }
                else {
                    setStatus('FFmpeg加载完成')
                }
            }
            else if (type === TaskType.parseM3u8) {
                if (progress === 0) {
                    setStatus('解析m3u8文件..')
                }
                else {
                    setStatus('m3u8文件解析完成')
                }
            }
            else if (type === TaskType.downloadTs) {
                const percent = Math.round(progress * 100)
                setProgress(percent)
                setStatus(`下载ts分片: ${percent}%`)
            }
            else if (type === TaskType.mergeTs) {
                if (progress === 0) {
                    setStatus('合并ts分片..')
                }
                else {
                    setStatus('ts分片完成')
                }
            }
            setDownloading(type === TaskType.downloadTs)
        })
    }, [])

    useEffect(() => {
        if (url) {
            startDownload()
        }
    }, [url])

    return (
        <NoSsr>
            <Stack sx={{
                position: 'relative',
                height: '100%',
                backgroundImage: 'var(--linear-gradient-image)'
            }}>
                <Stack sx={(theme) => ({
                    position: 'absolute',
                    width: '100%',
                    left: '50%',
                    top: busy ? theme.spacing(5) : '50%',
                    transform: 'translate(-50%, -50%)',
                    px: 2,
                    transition: theme.transitions.create('top'),
                    transitionDelay: busy ? 0 : '.4s',
                    zIndex: 20,
                    [theme.breakpoints.up('sm')]: {
                        width: 450,
                        px: 0
                    }
                })} direction="row" columnGap={1} component="form" onSubmit={
                    (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        if (!busy) {
                            startDownload()
                        }
                    }
                }>
                    <TextField
                        sx={{
                            flexGrow: 1
                        }}
                        label="hls地址"
                        name="url"
                        size="small"
                        type="url"
                        value={input}
                        disabled={busy}
                        onChange={
                            (event: React.ChangeEvent<HTMLTextAreaElement>) => {
                                setInput(
                                    event.target.value
                                )
                            }
                        }
                    />
                    <Button variant="outlined" type="submit" disabled={busy}>{busy ? '下载中..' : '下载'}</Button>
                </Stack>
                <Stack sx={(theme) => ({
                    position: 'relative',
                    width: '100%',
                    maxWidth: 800,
                    height: '100%',
                    transition: theme.transitions.create(['opacity']),
                    transitionDelay: busy ? '.4s' : 0,
                    overflow: 'hidden',
                    margin: '0 auto',
                    opacity: busy ? 1 : 0
                })}>
                    <Stack
                        sx={{
                            height: '100%',
                        }}
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Stack
                            sx={{
                                p: 3,
                                width: '100%'
                            }}
                            rowGap={1}>
                            <Typography>{status}</Typography>
                            <LinearProgress
                                variant={downloading ? 'determinate' : 'query'}
                                value={progress}
                            />
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
        </NoSsr>
    )
}

export default HlsDownload