import React, { useState, useEffect, useMemo, useRef } from 'react'
import type { PageProps, GetServerDataProps, GetServerDataReturn } from 'gatsby'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Typography from '@mui/material/Typography'
import { TabPanel } from '~/components/layout'
import ThumbLoader from '~/components/search/ThumbLoader'
import useLocalStorageState from '~/components/hook/useLocalStorageState'
import RowClipTypography from '~/components/layout/element/RowClipTypography'
import { LoadingScreen } from '~/components/loading'
import NoData from '~/components/search/NoData'
import { getJson } from '~/adaptors/common'
import VideoUrlParser from '~/components/search/VideoUrlParser'
import { VideoPlayer, type PlayState } from '~/components/player'
import { pureHlsUrl } from '~/util/proxy'
import { Api } from '~/util/config'
import * as css from './style.module.css'

interface VideoParams {
    seek: number;
}

function createVideoParams(): VideoParams {
    return {
        seek: 0
    }
}

type PlayHistory = {
    params: VideoParams;
    sourceIndex: number;
    episodeIndex: number;
}

interface VideoPlayProps {
    id: string;
    video: VideoInfo;
}

function VideoPlay({ id, video }: VideoPlayProps) {

    const [activeTab, setActiveTab] = useState(0)
    const [playHistory, setPlayHistory] = useLocalStorageState<PlayHistory>(id, {
        params: createVideoParams(),
        sourceIndex: 0,
        episodeIndex: 0
    })
    const paramsLastCache = useRef(+new Date())
    const [ready, setReady] = useState(false)
    const { data, init } = playHistory
    const { sourceIndex, episodeIndex, params } = data

    const pageTitle = useMemo(() => video.name, [video])
    const activeSource = useMemo(() => video?.dataList[sourceIndex], [video, sourceIndex])
    const playingVideo = useMemo(() => activeSource.urls[episodeIndex], [activeSource, episodeIndex])

    const isLast = useMemo(() => episodeIndex === activeSource?.urls.length - 1, [episodeIndex])

    const videoFullTitle = useMemo(() => video?.name + ' - ' + playingVideo.label, [video, playingVideo])

    const onTimeUpdate = ({ progress, duration }: PlayState) => {
        const nowTime = Date.now()
        if (nowTime - paramsLastCache.current > 3e3) {
            const params = {
                seek: progress * duration
            };
            setPlayHistory(history => ({
                ...history,
                params
            }))
            paramsLastCache.current = nowTime;
        }
    }

    const playVideo = (episode: number) => {
        setPlayHistory(
            ({ episodeIndex, params, ...rest }) => ({
                episodeIndex: episode,
                params: createVideoParams(),
                ...rest
            })
        )
    }

    const playNext = () => {
        if (!isLast) {
            playVideo(episodeIndex + 1)
        }
    }

    useEffect(() => {
        if (init) {
            setReady(true)
        }
    }, [init])

    return (
        <Box sx={{
            height: '100%',
            backgroundImage: 'var(--linear-gradient-image)'
        }}>
            <title>{pageTitle}</title>
            {
                video ? (
                    <Box sx={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: 1200,
                        height: '100%',
                        zIndex: 5,
                        overflow: 'hidden',
                        margin: '0 auto',
                        boxShadow: 'rgb(0 0 0 / 50%) 2px 2px 15px'
                    }}>
                        <Stack sx={
                            (theme) => ({
                                height: '100%',
                                [theme.breakpoints.up('sm')]: {
                                    overflowY: 'auto'
                                }
                            })
                        }>
                            <Box sx={(theme) => ({
                                background: '#000',
                                overflow: 'hidden',
                                height: '45%',
                                flexShrink: 0,
                                [theme.breakpoints.up('sm')]: {
                                    height: 'min(calc(min(100vw, 1200px) * 10 / 16), 600px)',
                                    maxHeight: '100vh'
                                }
                            })}>
                                {
                                    ready && (
                                        <VideoUrlParser url={playingVideo.url}>
                                            {
                                                (url: string) => (
                                                    <VideoPlayer
                                                        title={videoFullTitle}
                                                        url={pureHlsUrl(url)}
                                                        hls
                                                        autoplay
                                                        initPlayTime={params.seek}
                                                        onTimeUpdate={onTimeUpdate}
                                                        onNext={isLast ? undefined : playNext}
                                                        onEnd={playNext}
                                                    />
                                                )
                                            }
                                        </VideoUrlParser>
                                    )
                                }
                            </Box>
                            {
                                activeSource.urls.length > 1 && (
                                    <Box sx={{
                                        bgcolor: 'background.paper',
                                        p: 1.5
                                    }}>
                                        <Typography
                                            variant="subtitle1"
                                            align="center"
                                        >{videoFullTitle}</Typography>
                                    </Box>
                                )
                            }
                            <Stack
                                flexGrow={1}
                                sx={(theme) => ({
                                    [theme.breakpoints.only('xs')]: {
                                        overflow: 'hidden'
                                    }
                                })}
                            >
                                <Box sx={(theme) => ({
                                    position: 'relative',
                                    zIndex: 4,
                                    width: '100%',
                                    bgcolor: 'background.paper',
                                    borderBottom: 1,
                                    borderColor: 'divider',
                                    [theme.breakpoints.only('xs')]: {
                                        transition: theme.transitions.create('box-shadow'),
                                        boxShadow: 'rgb(0 0 0 / 10%) 0 4px 4px'
                                    }
                                })}>
                                    <Tabs
                                        value={activeTab}
                                        onChange={
                                            (_event, active: number) => setActiveTab(active)
                                        }
                                        centered
                                    >
                                        <Tab label="简介" />
                                        <Tab label="选集" />
                                        <Tab label="同类推荐" />
                                    </Tabs>
                                </Box>
                                <TabPanel index={0} value={activeTab} disablePadding>
                                    <VideoProfile video={video} />
                                </TabPanel>
                                <TabPanel index={1} value={activeTab} disablePadding>
                                    <Stack
                                        direction="row"
                                        sx={(theme) => ({
                                            height: '100%',
                                            [theme.breakpoints.up('sm')]: {
                                                minHeight: 250
                                            }
                                        })}
                                    >
                                        {
                                            video.dataList.length > 1 && (
                                                <Tabs
                                                    sx={{
                                                        borderRight: 1,
                                                        borderColor: 'divider',
                                                        flexShrink: 0,
                                                        my: 1.5
                                                    }}
                                                    orientation="vertical"
                                                    variant="scrollable"
                                                    value={sourceIndex}
                                                    onChange={
                                                        (_event, active: number) => setPlayHistory(
                                                            ({ sourceIndex, ...rest }) => ({
                                                                sourceIndex: active,
                                                                ...rest
                                                            })
                                                        )
                                                    }>
                                                    {
                                                        video.dataList.map(
                                                            (source: VideoSource, index: number) => (
                                                                <Tab label={source.name} key={index} />
                                                            )
                                                        )
                                                    }
                                                </Tabs>
                                            )
                                        }
                                        <Box
                                            sx={(theme) => ({
                                                width: '100%',
                                                [theme.breakpoints.only('xs')]: {
                                                    flexGrow: 1,
                                                    overflowY: 'auto'
                                                }
                                            })}
                                        >
                                            {
                                                video.dataList.map(
                                                    (source: VideoSource, index: number) => (
                                                        <TabPanel
                                                            index={index}
                                                            value={sourceIndex}
                                                            key={index}
                                                            disablePadding
                                                        >
                                                            <Stack
                                                                direction="row"
                                                                flexWrap="wrap"
                                                                flexGrow={1}
                                                                sx={(theme) => ({
                                                                    p: 1.5,
                                                                    [theme.breakpoints.only('xs')]: {
                                                                        overflowY: 'auto'
                                                                    }
                                                                })}
                                                            >
                                                                {
                                                                    source.urls.map(
                                                                        (video: VideoItem, index: number) => (
                                                                            <Box className={css.cell} key={index}>
                                                                                <Button
                                                                                    fullWidth
                                                                                    disableElevation
                                                                                    variant={
                                                                                        episodeIndex === index ? 'contained' : 'outlined'
                                                                                    } sx={{
                                                                                        whiteSpace: 'nowrap',
                                                                                        overflow: 'hidden',
                                                                                        textOverflow: 'ellipsis'
                                                                                    }} size="small" onClick={
                                                                                        () => {
                                                                                            if (episodeIndex !== index) {
                                                                                                playVideo(index)
                                                                                            }
                                                                                        }
                                                                                    }>{video.label}</Button>
                                                                            </Box>
                                                                        )
                                                                    )
                                                                }
                                                            </Stack>
                                                        </TabPanel>
                                                    )
                                                )
                                            }
                                        </Box>
                                    </Stack>
                                </TabPanel>
                                <TabPanel index={2} value={activeTab} disablePadding>
                                    <Box sx={{
                                        height: '100%',
                                        p: 1.5,
                                        overflowY: 'auto'
                                    }}>
                                        <RelatedList data={video.related} />
                                    </Box>
                                </TabPanel>
                            </Stack>
                        </Stack>
                    </Box>
                ) : (
                    <NoData text="💔 数据解析错误.." />
                )
            }
        </Box>
    )
}

interface VideoProfileProps {
    video: VideoInfo;
}

function VideoProfile({ video }: VideoProfileProps) {

    return (
        <Box
            sx={(theme) => ({
                height: '100%',
                p: 1.5,
                [theme.breakpoints.only('xs')]: {
                    overflowY: 'auto',
                }
            })}>
            <Stack
                direction="row"
                columnGap={1.5}
                sx={{
                    pb: 3
                }}
            >
                <Box sx={(theme) => ({
                    width: '36%',
                    aspectRatio: '2 / 3',
                    flexShrink: 0,
                    [theme.breakpoints.up('sm')]: {
                        width: 180
                    }
                })}>
                    <ThumbLoader
                        src={video.pic}
                        alt={video.name}
                    />
                </Box>
                <Box
                    sx={{
                        flexGrow: 1,
                        overflow: 'hidden'
                    }}
                >
                    <Typography variant="h5" lineHeight={1.2}>{video.name}</Typography>
                    <Typography variant="body1" gutterBottom>{video.note}</Typography>
                    {
                        video.subname && (
                            <Typography>又名:{video.subname}</Typography>
                        )
                    }
                    <Typography variant="body1">类别:{video.type}</Typography>
                    <Typography variant="body1">年份:{video.year}</Typography>
                    {
                        video.area && (
                            <Typography variant="body1">地区:{video.area}</Typography>
                        )
                    }
                    {
                        video.director && (
                            <Typography variant="body1">导演:{video.director}</Typography>
                        )
                    }
                    {
                        video.actor && (
                            <Typography variant="body1">演员:{video.actor}</Typography>
                        )
                    }
                    <Box
                        dangerouslySetInnerHTML={{
                            __html: video.des
                        }}
                    />
                </Box>
            </Stack>
        </Box>
    )
}


interface RelatedListProps {
    data: VideoRelated[];
}

function RelatedList({ data }: RelatedListProps) {
    return (
        <Grid spacing={1} container>
            {
                data.map(
                    ({ id, name, note, last }) => (
                        <Grid xs={12} sm={6} lg={4} xl={3} key={id} item>
                            <Card elevation={2}>
                                <CardActionArea href={`/video/play/${id}/`}>
                                    <Stack direction="row">
                                        <Box sx={{
                                            width: 96,
                                            height: 128,
                                            flexShrink: 0
                                        }}>
                                            <ThumbLoader
                                                src={`${Api.assetSite}/api/video/poster/${id}`}
                                                aspectRatio="3 / 4"
                                            />
                                        </Box>
                                        <Box sx={{
                                            flexGrow: 1,
                                            p: 1,
                                            overflow: 'hidden'
                                        }}>
                                            <Stack sx={{
                                                height: '100%'
                                            }}>
                                                <Box sx={{
                                                    flexGrow: 1
                                                }}>
                                                    <RowClipTypography
                                                        rows={2}
                                                        paragraph
                                                    >{name}</RowClipTypography>
                                                    <Typography variant="subtitle2" color="text.secondary">{note}</Typography>
                                                </Box>
                                                <Typography variant="subtitle2" color="text.secondary" align="right">{last}</Typography>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    )
                )
            }
        </Grid>
    )
}


type ServerProps = {
    id: string;
}

export async function getServerData({ params }: GetServerDataProps): Promise<GetServerDataReturn<ServerProps>> {
    const { id } = params as ServerProps;
    return {
        props: {
            id
        }
    }
}

export default function Page({ serverData }: PageProps<object, object, unknown, ServerProps>) {

    const id = serverData?.id
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)

    useEffect(() => {
        (async function getVideoInfo() {
            try {
                const { code, data } = await getJson<ApiJsonType<VideoInfo>>(`/api/video/detail/${id}`)
                if (code === 0) {
                    setVideoInfo(data)
                }
                else {
                    throw new Error('request failed')
                }
            }
            catch (err) {
                console.error('💔 Get data error: ' + err)
                setTimeout(getVideoInfo, 1e3)
            }
        })()
    }, [])
    return videoInfo ? (
        <VideoPlay
            id={id}
            video={videoInfo}
        />
    ) : (
        <LoadingScreen />
    )
}
