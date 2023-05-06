import React from 'react';
import Box from '@mui/material/Box';
import VideoPlayer from '../components/player/VideoPlayer';

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
                url="https://cdn12.yzzy-tv-cdn.com/20221217/11433_5e900683/index.m3u8"
                hls
                autoplay
            />
        </Box>
    )
}
