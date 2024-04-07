import React, { useState, useEffect, useRef } from 'react'
import Hls from 'hls.js'
import Hls2Mp4 from 'hls2mp4'

export function Head() {
    return (
        <>
            <title key="hls2mp4">hls2mp4 demo</title>
        </>
    )
}

type Log = {
    id: number;
    text: string;
}

function Hls2Mp4Demo() {

    const [logs, setLogs] = useState<Log[]>([])
    const [downloading, setDownloading] = useState(false)
    const hls2Mp4 = useRef<Hls2Mp4 | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const logScrollerRef = useRef<HTMLUListElement | null>(null)
    const nextId = useRef(0)
    const testUrl = 'https://test-streams.mux.dev/x36xhzz/url_2/193039199_mp4_h264_aac_ld_7.m3u8'

    const addLog = (log: string) => {
        setLogs(
            logs => {
                nextId.current++
                return [
                    ...logs,
                    {
                        id: nextId.current,
                        text: log
                    }
                ]
            }
        )
    }

    useEffect(() => {
        logScrollerRef.current.scrollTop = logScrollerRef.current.scrollHeight
    }, [logs])

    useEffect(() => {
        const video = videoRef.current
        if (Hls.isSupported()) {
            var hls = new Hls()
            hls.loadSource(testUrl)
            hls.attachMedia(video)
            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                video.muted = true
                video.play()
            })
        }
        else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = testUrl
            video.addEventListener('canplay', () => {
                video.play()
            })
        }

        hls2Mp4.current = new Hls2Mp4({
            maxRetry: 5,
            tsDownloadConcurrency: 20
        }, (type, progress) => {
            const TaskType = Hls2Mp4.TaskType;
            if (type === TaskType.loadFFmeg) {
                if (progress === 0) {
                    addLog('loading FFmpeg')
                }
                else {
                    addLog('FFmpeg load complete')
                }
            }
            else if (type === TaskType.parseM3u8) {
                if (progress === 0) {
                    addLog('parse m3u8')
                }
                else {
                    addLog('m3u8 parsed complete')
                }
            }
            else if (type === TaskType.downloadTs) {
                addLog('download ts segments: ' + Math.round(progress * 100) + '%')
            }
            else if (type === TaskType.mergeTs) {
                if (progress === 0) {
                    addLog('merge ts segments')
                }
                else {
                    addLog('ts segments merged complete')
                }
            }
        })
    }, [])

    return (
        <div className="hls-demo">
            <video
                style={{
                    display: 'block',
                    width: '100%'
                }}
                height="400"
                ref={videoRef}
                controls
            />

            <div
                style={{
                    margin: 10
                }}
            >
                <button
                    disabled={downloading}
                    onClick={
                        async () => {
                            setDownloading(true)
                            const buffer = await hls2Mp4.current.download(testUrl)
                            hls2Mp4.current.saveToFile(buffer, 'test.mp4')
                            setDownloading(false)
                        }
                    }>Download to mp4</button>
            </div>
            <ul
                style={{
                    maxHeight: 200,
                    overflowY: 'auto'
                }}
                ref={logScrollerRef}
            >
                {
                    logs.map(
                        ({ id, text }) => (
                            <li key={id}>{text}</li>
                        )
                    )
                }
            </ul>
        </div>
    )
}

export default Hls2Mp4Demo