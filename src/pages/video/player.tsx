import React from 'react'
import type { GetServerDataProps, GetServerDataReturn, PageProps } from 'gatsby'
import NoSsr from '@mui/material/NoSsr'
import Box from '@mui/material/Box'
import { VideoPlayer } from '~/components/player'
import VideoUrlParser from '~/components/search/VideoUrlParser'
import { getParamsUrl } from '~/util/proxy'
import { M3u8 } from '~/util/regExp'

interface ServerProps {
    url: string;
}

export async function getServerData({ query }: GetServerDataProps): Promise<GetServerDataReturn<ServerProps>> {
    const { url } = query as Record<'url', string>;
    return {
        props: {
            url
        }
    }
}

const VideoParserPlayer: React.FC<PageProps<object, object, unknown, ServerProps>> = ({ serverData }) => {

    const queryUrl = serverData.url
    const hls = M3u8.isM3u8Url(queryUrl)

    return (
        <NoSsr>
            <Box sx={{
                height: '100%',
                bgcolor: '#000'
            }}>
                <VideoUrlParser url={queryUrl}>
                    {
                        (url) => (
                            <VideoPlayer
                                url={getParamsUrl('/api/video/m3u8-pure', { url })}
                                hls={hls}
                                autoplay
                            />
                        )
                    }
                </VideoUrlParser>
            </Box>
        </NoSsr>
    )
}

export default VideoParserPlayer