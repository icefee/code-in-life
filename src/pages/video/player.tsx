import React, { useState, useEffect } from 'react';
import { type PageProps } from 'gatsby';
import Box from '@mui/material/Box';
import { LoadingScreen } from '../../components/loading';
import VideoPlayer from '../../components/player/PlayerBase';
import { M3u8 } from '../../util/RegExp';

interface VideoParserPlayerProps {
    url: string;
}

const VideoParserPlayer: React.FC<PageProps<object, object, unknown, VideoParserPlayerProps>> = ({ serverData }) => {
    const { url } = serverData;
    const needParse = M3u8.isM3u8Url(url) || /\.(mp4)$/.test(url);
    const [loading, setLoading] = useState(false)
    const [parsedUrl, setParsedUrl] = useState(
        needParse ? null : url
    )
    useEffect(() => {
        const parseUrl = async () => {
            setLoading(true)
            try {
                const { code, data } = await fetch(`/api/video/parse?url=${url}`).then<{
                    code: number;
                    data: string;
                }>(
                    response => response.json()
                )
                if (code === 0) {
                    setParsedUrl(data)
                }
            }
            catch (err) {
                parseUrl()
            }
            setLoading(false)
        }
        if (needParse) {
            parseUrl()
        }
    }, [])

    if (loading) {
        return (
            <LoadingScreen />
        )
    }
    return (
        <Box sx={{
            height: '100%',
            bgcolor: '#000'
        }}>
            <VideoPlayer url={parsedUrl} />
        </Box>
    )
}

export default VideoParserPlayer;
