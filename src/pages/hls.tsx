import React from 'react';
import Box from '@mui/material/Box';
import loadable from '@loadable/component'

const VideoPlayer = loadable(() => import('../components/player/VideoPlayer'))

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

export default function Hls() {
    return (
        <Box sx={{
            height: 400
        }}>
            <VideoPlayer
                title="测试m3u8视频"
                url="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
                hls
                autoplay
            />
        </Box>
    )
}
