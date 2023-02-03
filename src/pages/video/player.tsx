import React from 'react';
import { type PageProps, type GetServerDataProps } from 'gatsby';
import Box from '@mui/material/Box';
import VideoPlayer from '../../components/player/PlayerBase';
import { M3u8 } from '../../util/RegExp';

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

async function getM3u8Url(url: string) {
    try {
        const html = await fetch(url).then(
            response => response.text()
        );
        const matchedUrls = html.match(M3u8.match);
        if (matchedUrls) {
            const parsedUrl = matchedUrls[0];
            if (parsedUrl.startsWith('http')) {
                return parsedUrl;
            }
            const uri = new URL(url);
            if (parsedUrl.startsWith('/')) {
                return uri.origin + parsedUrl;
            }
            const paths = uri.pathname.split('/');
            paths.pop();
            return uri.origin + paths.join('/') + '/' + parsedUrl;
        }
    }
    catch (err) {
        console.log('💔 req failed')
    }
    return null;
}

export async function getServerData({ query }: GetServerDataProps) {
    const { url } = query as Record<'url', string>;
    if (url) {
        if (M3u8.isM3u8Url(url)) {
            return {
                props: {
                    url
                }
            }
        }
        else {
            try {
                const parsedUrl = await getM3u8Url(url)
                if (parsedUrl) {
                    return {
                        props: {
                            url: parsedUrl
                        }
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
