import React, { useState } from 'react'
import type { GetServerDataProps, GetServerDataReturn, PageProps } from 'gatsby'
import NoSsr from '@mui/material/NoSsr'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded'
import { VideoPlayer } from '~/components/player'
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

const VideoParserPlayer: React.FC<PageProps<object, object, unknown, ServerProps>> = ({ serverData }) => {

    const queryUrl = serverData.url
    const [localPlayUrl, setLocalPlayUrl] = useState<string>(null)

    return (
        <NoSsr>
            <Box
                sx={{
                    height: '100%',
                    bgcolor: '#000'
                }}
            >
                {
                    localPlayUrl === null ? Boolean(queryUrl) ? (
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
                    ) : null : (
                        <VideoPlayer
                            url={localPlayUrl}
                            hls
                            autoplay
                        />
                    )
                }
                <IconButton
                    color='primary'
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 180
                    }}
                    onClick={
                        async () => {
                            const file = await openFile('.m3u8')
                            if (file !== null) {
                                let oldLocalUrl = localPlayUrl
                                const url = URL.createObjectURL(file)
                                setLocalPlayUrl(url)
                                setTimeout(() => {
                                    if (oldLocalUrl !== null) {
                                        URL.revokeObjectURL(oldLocalUrl)
                                    }
                                }, 1000)
                            }
                        }
                    }
                >
                    <FileUploadRoundedIcon />
                </IconButton>
            </Box>
        </NoSsr>
    )
}

export default VideoParserPlayer