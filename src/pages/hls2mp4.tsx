import React, { useState } from 'react'
import { Script } from 'gatsby'

export async function getServerData() {
    return {
        status: 200,
        headers: {
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin'
        },
        props: {}
    }
}

export async function config() {
    return () => {
        return {
            defer: true,
        }
    }
}

function Hls2Mp4Demo() {

    const [hlsLoaded, setHlsLoaded] = useState(false)
    const [ffmpegLoaded, setFFmpegLoaded] = useState(false)

    return (
        <>
            <Script src="/api/proxy?url=https://hlsjs.video-dev.org/dist/hls.js" onLoad={
                () => setHlsLoaded(true)
            } />
            <Script src="/api/proxy?url=https://unpkg.com/@ffmpeg.wasm/main@0.12.0/dist/ffmpeg.min.js" onLoad={
                () => setFFmpegLoaded(true)
            } />
            {
                ffmpegLoaded && (
                    <Script src="/api/proxy?url=https://unpkg.com/hls2mp4@1.1.9/hls2mp4.js" />
                )
            }
            <div className="hls-demo">
                <video style={{
                    display: 'block',
                    width: '100%'
                }} height="400" id="video" controls />

                <div style={{
                    margin: 10
                }}>
                    <button id="dl-btn">Download to mp4</button>
                </div>
                <ul id="logs" style={{
                    maxHeight: 200,
                    overflowY: 'auto'
                }} />
            </div>
            {
                hlsLoaded && (
                    <Script defer>
                        {`
                           var video = document.getElementById('video');            
                           var testUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
                           if (Hls.isSupported()) {
                            var hls = new Hls();
                            hls.loadSource(testUrl);
                            hls.attachMedia(video);
                            hls.on(Hls.Events.MEDIA_ATTACHED, function () {
                              video.muted = true;
                              video.play();
                            });
                          }
                          else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                            video.src = testUrl;
                            video.addEventListener('canplay', function () {
                              video.play();
                            });
                          }

                          const logs = document.getElementById('logs')

                          function logMsg(msg) {
                            var li = document.createElement('li')
                            li.innerText = msg;
                            logs.appendChild(li);
                            logs.scrollTop = logs.scrollHeight + logs.clientHeight;
                          }
                          
                          const downloadBtn = document.getElementById('dl-btn')
                          downloadBtn.addEventListener('click', async function() {

                            this.setAttribute('disabled', 'disabled')
                            
                            const hls2Mp4 = new Hls2Mp4({
                                log: true,
                                maxRetry: 5,
                                tsDownloadConcurrency: 20
                            }, (type, progress) => {
                                const TaskType = Hls2Mp4.TaskType;
                                if (type === TaskType.loadFFmeg) {
                                    if (progress === 0) {
                                        logMsg('load FFmpeg')
                                    }
                                    else {
                                        logMsg('FFmpeg load complete')
                                    }
                                }
                                else if (type === TaskType.parseM3u8) {
                                    if (progress === 0) {
                                        logMsg('parse m3u8')
                                    }
                                    else {
                                        logMsg('m3u8 parsed complete')
                                    }
                                }
                                else if (type === TaskType.downloadTs) {
                                    logMsg('download ts segments: ' + Math.round(progress * 100) + '%')
                                }
                                else if (type === TaskType.mergeTs) {
                                    if (progress === 0) {
                                        logMsg('merge ts segments')
                                    }
                                    else {
                                        logMsg('ts segments merged complete')
                                    }
                                }
                            })
                            const buffer = await hls2Mp4.download(testUrl)
                            hls2Mp4.saveToFile(buffer, 'test.mp4')
                            this.removeAttribute('disabled')
                          });

                        `}
                    </Script>
                )
            }
        </>
    )
}

export default Hls2Mp4Demo