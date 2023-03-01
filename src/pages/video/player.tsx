import React from 'react';
import { type PageProps } from 'gatsby';
import Box from '@mui/material/Box';
import VideoUrlParser from '../../components/search/VideoUrlParser';
import VideoPlayer from '../../components/player/PlayerBase';

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
                        <VideoPlayer url={parsedUrl} />
                    )
                }
            </VideoUrlParser>
        </Box>
    )
}

export default VideoParserPlayer;
