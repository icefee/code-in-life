import React, { useState, useEffect, useRef } from 'react'
import type { GetServerDataProps, GetServerDataReturn, PageProps } from 'gatsby'
import NoSsr from '@mui/material/NoSsr'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Hls2Mp4 from 'hls2mp4'
import HeadLayout from '~/components/layout/Head'
import useErrorMessage from '~/components/hook/useErrorMessage'
import { M3u8 } from '~/util/regExp'

export function Head() {
    return (
        <HeadLayout>
            <title>hls视频下载</title>
        </HeadLayout>
    )
}

interface ServerProps {
    url: string | null;
    title: string | null;
}

export async function getServerData({ query }: GetServerDataProps): Promise<GetServerDataReturn<ServerProps>> {
    const {
        url = null,
        title = null
    } = query as Record<'url' | 'title', string>;
    return {
        props: {
            url,
            title
        }
    }
}

function HlsDownload({ serverData }: PageProps<object, object, unknown, ServerProps>) {

    const url = serverData?.url
    const title = serverData?.title
    const [input, setInput] = useState(url ?? '')
    const [busy, setBusy] = useState(false)
    const hls2Mp4 = useRef<Hls2Mp4 | null>(null)
    const [status, setStatus] = useState('')
    const [downloading, setDownloading] = useState(false)
    const [progress, setProgress] = useState(0)

    const { showErrorMessage: showError, hideAll } = useErrorMessage()
    // const urlMatchRegExp = new RegExp('^https?://[\\w\\u4e00-\\u9fa5-./@%?:]+?\\.m3u8$', 'i')

    const getFileName = (url: string) => {
        const fileNameMatch = url.match(/[^\/]+$/)
        return fileNameMatch ? fileNameMatch[0].replace(/\.m3u8$/, '') : `${+new Date()}`
    }

    const testUrl = async (url: string) => {
        try {
            const response = await fetch(url)
            // const contentType = response.headers.get('content-type')
            // const valid = /application\/vnd.apple.mpegurl|application\/octet-stream/i.test(contentType)
            const content = await response.text()
            const valid = M3u8.checkContent(content)
            return {
                url: response.url,
                valid
            }
        }
        catch (err) {
            return {
                url,
                valid: false
            }
        }
    }

    const startDownload = async (source: string) => {
        if (!/^https?:\/\/.+\.[a-z]{2,5}.*/.test(source)) {
            showError({
                message: '非法的地址'
            })
            return
        }
        try {
            setBusy(true)
            setStatus('检测hls地址..')
            const { valid, url } = await testUrl(source)
            if (valid) {
                const buffer = await hls2Mp4.current.download(url)
                if (buffer) {
                    const fileName = title ?? getFileName(source)
                    hls2Mp4.current.saveToFile(buffer, `${fileName}.mp4`)
                }
                else {
                    throw new Error('下载出错')
                }
                setBusy(false)
            }
            else {
                throw new Error('非法的hls内容')
            }
        }
        catch (err) {
            showError({
                message: String(err)
            })
            setTimeout(
                () => {
                    setBusy(false)
                    setStatus('')
                    setDownloading(false)
                    setProgress(0)
                    hideAll()
                },
                1e3
            )
        }
    }

    useEffect(() => {
        hls2Mp4.current = new Hls2Mp4({
            maxRetry: 5,
            tsDownloadConcurrency: 3,
            onProgress: (type, progress) => {
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
            }
        })
    }, [])

    useEffect(() => {
        if (url) {
            startDownload(url)
        }
    }, [url])

    return (
        <NoSsr>
            <Stack
                sx={{
                    position: 'relative',
                    height: '100%',
                    backgroundImage: 'var(--linear-gradient-image)'
                }}
            >
                <Stack
                    sx={({ spacing, transitions, breakpoints }) => ({
                        position: 'absolute',
                        width: '100%',
                        left: '50%',
                        top: busy ? spacing(5) : '50%',
                        transform: 'translate(-50%, -50%)',
                        px: 2,
                        transition: transitions.create('top'),
                        transitionDelay: busy ? 0 : '.4s',
                        zIndex: 20,
                        [breakpoints.up('sm')]: {
                            width: 450,
                            px: 0
                        }
                    })}
                    direction="row"
                    columnGap={1}
                    component="form"
                    onSubmit={
                        (event: React.FormEvent<HTMLFormElement>) => {
                            event.preventDefault();
                            if (!busy) {
                                startDownload(input)
                            }
                        }
                    }
                >
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
                <Stack
                    sx={({ transitions }) => ({
                        position: 'relative',
                        width: '100%',
                        maxWidth: 600,
                        height: '100%',
                        transition: transitions.create(['opacity']),
                        transitionDelay: busy ? '.4s' : 0,
                        overflow: 'hidden',
                        margin: '0 auto',
                        opacity: busy ? 1 : 0
                    })}
                >
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
                                variant={downloading ? 'determinate' : 'indeterminate'}
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