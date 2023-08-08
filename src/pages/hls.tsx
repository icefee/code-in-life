import React from 'react'
import Box from '@mui/material/Box'
import { VideoPlayer } from '~/components/player'
import { crossOriginIsolatedHeaders } from '~/util/middleware'

export async function getServerData() {
    return {
        status: 200,
        headers: crossOriginIsolatedHeaders
    }
}

export default function Hls() {
    /*
    const downloadFile = async () => {
        const url = 'https://vip5.ddyunbo.com/20230511/osALPV7i/700kb/hls/index.m3u8'
        const hls2Mp4 = new Hls2Mp4({
            log: true,
            maxRetry: 5,
            tsDownloadConcurrency: 20
        })
        const buffer = await hls2Mp4.download(url)
        hls2Mp4.saveToFile(buffer, `test.mp4`)
    }
    */
    return (
        <Box sx={{
            height: 400
        }}>
            {/* <button onClick={downloadFile}>start</button> */}
            <VideoPlayer
                title="测试m3u8视频"
                url="https://cdn12.yzzy-tv-cdn.com/20221217/11433_5e900683/index.m3u8"
                hls
                autoplay
            />
        </Box>
    )
}
