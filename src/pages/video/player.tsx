import React from 'react';
import { type PageProps, type GetServerDataProps } from 'gatsby';
import Box from '@mui/material/Box';
import VideoPlayer from '../../components/player/PlayerBase';
import { M3u8 } from '../../util/RegExp';
import { getM3u8Url } from '../../components/search/api';

interface VideoParserPlayerProps {
    url: string;
}

const VideoParserPlayer: React.FC<PageProps<object, object, unknown, VideoParserPlayerProps>> = ({ serverData }) => {
    return (
        <Box sx={{
            height: '100%',
            bgcolor: '#000'
        }}>
            <VideoPlayer url={serverData.url} />
        </Box>
    )
}

export async function getServerData({ query }: GetServerDataProps) {
    const { url } = query as Record<'url', string>;
    if (url) {
        const headers = {
            'x-frame-options': 'ALLOW-FROM https://cif.stormkit.dev/video'
        }
        if (M3u8.isM3u8Url(url)) {
            return {
                props: {
                    url
                },
                headers
            }
        }
        else {
            try {
                const parsedUrl = await getM3u8Url(url)
                if (parsedUrl) {
                    return {
                        props: {
                            url: parsedUrl
                        },
                        headers
                    }
                }
                else {
                    throw new Error('fetch error.')
                }
            }
            catch (err) {
                return {
                    status: 404
                }
            }
        }
    }
    return {
        status: 404
    }
}

export default VideoParserPlayer;
