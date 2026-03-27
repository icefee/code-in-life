import React, { useState } from 'react'
import type { GetServerDataProps, GetServerDataReturn, PageProps } from 'gatsby'
import NoSsr from '@mui/material/NoSsr'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import FileUploadRoundedIcon from '@mui/icons-material/FileUpload'
import { VideoPlayer, type VideoPlayerProps } from '~/components/player'
import VideoUrlParser from '~/components/search/VideoUrlParser'
import { pureHlsUrl } from '~/util/proxy'
import { M3u8 } from '~/util/regExp'
import { openFile } from '~/util/blob'

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

interface LocalVideo extends Pick<VideoPlayerProps, 'url' | 'hls'> { }

const VideoParserPlayer: React.FC<PageProps<object, object, unknown, ServerProps>> = ({ serverData }) => {

    const queryUrl = serverData.url
    const [localVideo, setLocalVideo] = useState<LocalVideo | null>(null)
    const queryUrlValid = typeof queryUrl === 'string' && queryUrl.startsWith('http')

    const createPlayer = (props: Pick<VideoPlayerProps, 'url' | 'hls'>) => (
        <VideoPlayer
            {...props}
            autoplay
        />
    )

    return (
        <NoSsr>
            <Box
                sx={{
                    height: '100%',
                    bgcolor: '#000'
                }}
            >
                {
                    localVideo === null ? queryUrlValid ? (
                        <VideoUrlParser url={queryUrl}>
                            {
                                (parsedUrl) => {
                                    const url = pureHlsUrl(parsedUrl)
                                    const hls = M3u8.isM3u8Url(url)
                                    return createPlayer({ url, hls })
                                }
                            }
                        </VideoUrlParser>
                    ) : null : createPlayer(localVideo)
                }
                <IconButton
                    color='primary'
                    size='large'
                    sx={{
                        position: 'absolute',
                        transition: 'all .4s',
                        zIndex: 180,
                        top: 12,
                        right: 12,
                        transform: (queryUrlValid || localVideo !== null) ? 'translate(calc(100% - 50vw), calc(50vh - 100%))' : 'none',
                    }}
                    onClick={
                        async () => {
                            const file = await openFile('.m3u8,.mp4')
                            if (file !== null) {
                                let localUrl = localVideo?.url
                                const url = URL.createObjectURL(file)
                                setLocalVideo({
                                    url,
                                    hls: M3u8.isM3u8Url(url)
                                })
                                setTimeout(() => {
                                    if (localUrl !== null) {
                                        URL.revokeObjectURL(localUrl)
                                    }
                                }, 1000)
                            }
                        }
                    }
                >
                    <FileUploadRoundedIcon
                        sx={{
                            fontSize: 32,
                        }}
                    />
                </IconButton>
            </Box>
        </NoSsr>
    )
}

export default VideoParserPlayer