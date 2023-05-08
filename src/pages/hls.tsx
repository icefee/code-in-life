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
                url="https://cdn8.hdzyk-video.com/20220726/10883_8a84978f/index.m3u8"
                hls
                autoplay
            />
        </Box>
    )
}
