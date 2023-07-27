import React from 'react'
import { type PageProps } from 'gatsby'
import Box from '@mui/material/Box'
import { VideoPlayer } from '~/components/player'
import VideoUrlParser from '~/components/search/VideoUrlParser'

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

interface VideoParserPlayerProps {
    url: string;
}

const VideoParserPlayer: React.FC<PageProps<object, object, unknown, VideoParserPlayerProps>> = ({ location }) => {
    const query = new URLSearchParams(location.search);
    const url = query.get('url');
    return (
        <Box sx={{
            height: '100%',
            bgcolor: '#000'
        }}>
            <VideoUrlParser url={url}>
                {
                    parsedUrl => (
                        <VideoPlayer autoplay hls url={parsedUrl} />
                    )
                }
            </VideoUrlParser>
        </Box>
    )
}

export default VideoParserPlayer