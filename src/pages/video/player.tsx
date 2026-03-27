import React, { useState, useMemo } from 'react'
import type { GetServerDataProps, GetServerDataReturn, PageProps } from 'gatsby'
import NoSsr from '@mui/material/NoSsr'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import FileUploadRoundedIcon from '@mui/icons-material/FileUpload'
import { VideoPlayer, type VideoPlayerProps } from '~/components/player'
import VideoUrlParser from '~/components/search/VideoUrlParser'
import { pureHlsUrl } from '~/util/proxy'
import { M3u8 } from '~/util/regExp'
import { openFile, blobToFile } from '~/util/blob'

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

    const localPlayer = useMemo(() => localVideo === null ? null : (
        <VideoPlayer
            {...localVideo}
            autoplay
        />
    ), [localVideo])

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
                                    return (
                                        <VideoPlayer
                                            url={url}
                                            hls={hls}
                                            autoplay
                                        />
                                    )
                                }
                            }
                        </VideoUrlParser>
                    ) : null : localPlayer
                }
                <IconButton
                    color='primary'
                    size='large'
                    sx={{
                        position: 'absolute',
                        transition: 'all .4s',
                        zIndex: 180,
                        left: 12,
                        top: 12,
                        transform: (queryUrlValid || localVideo !== null) ? 'none' : 'translate(calc(-100% + 16px + 50vw), calc(-100% + 16px + 50vh))',
                    }}
                    onClick={
                        async () => {
                            try {
                                const file = await openFile('.m3u8,.mp4')
                                if (file !== null) {
                                    let localUrl = localVideo?.url
                                    const url = URL.createObjectURL(file)
                                    setLocalVideo({
                                        url,
                                        hls: M3u8.isM3u8Url(file.name)
                                    })
                                    if (!localUrl) {
                                        setTimeout(() => {
                                            URL.revokeObjectURL(localUrl)
                                        }, 200)
                                    }
                                }
                            }
                            catch (err) {
                                const blob = new Blob([`${err}`], { type: 'text/plain' })
                                blobToFile(blob, 'log.txt')
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