import React, { Component, useState, useEffect, createRef } from 'react'
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
import RowClipTypography from '~/components/layout/element/RowClipTypography'
import { LoadingScreen } from '~/components/loading'
import NoData from '~/components/search/NoData'
import { getJson } from '~/adaptors/common'
import VideoUrlParser from '~/components/search/VideoUrlParser'
import { VideoPlayer, type PlayState } from '~/components/player'
import { getParamsUrl, proxyUrl } from '~/util/proxy'
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
    sourceIndex?: number;
    episodeIndex?: number;
}

function getHistory({ id }: VideoDetailProps): PlayHistory {
    const params = createVideoParams();
    const defaultHistory: PlayHistory = {
        params,
        episodeIndex: 0,
        sourceIndex: 0
    };
    const store = localStorage.getItem(id);
    return store ? JSON.parse(store) : defaultHistory;
}

function setHistory({ id }: VideoDetailProps, history: Partial<PlayHistory>): void {
    const store = localStorage.getItem(id);
    localStorage.setItem(id, JSON.stringify({
        ...(store ? JSON.parse(store) : null),
        ...history
    }))
}

interface VideoDetailProps {
    id: string;
    video: VideoInfo;
}

interface VideoDetailState {
    activeView: number; /* 0 简介, 1 选集 */
    activeSource: number;
    playingIndex: number;
}

class VideoDetail extends Component<VideoDetailProps, VideoDetailState> {

    public videoParams?: VideoParams;
    private lastUpdateTime = 0;
    public videoRef = createRef<HTMLVideoElement>()

    state: Readonly<VideoDetailState> = {
        activeView: 0,
        activeSource: 0,
        playingIndex: 0
    }

    componentDidMount() {
        const { params, sourceIndex = 0, episodeIndex = 0 } = getHistory(this.props);
        this.setState({
            activeSource: sourceIndex,
            playingIndex: episodeIndex
        })
        this.videoParams = params;
    }

    public get activeSource() {
        const { activeSource } = this.state;
        return this.props.video.dataList[activeSource];
    }

    public get playingVideo() {
        const { playingIndex } = this.state;
        return this.activeSource.urls[playingIndex]
    }

    public get isLastVideo() {
        return this.state.playingIndex === this.activeSource.urls.length - 1
    }

    public onPlaying({ duration, progress }: PlayState) {
        const nowTime = Date.now();
        if (nowTime - this.lastUpdateTime > 3e3) {
            const { activeSource, playingIndex } = this.state;
            const params = {
                seek: duration * progress
            };
            this.updateHistory({
                params,
                sourceIndex: activeSource,
                episodeIndex: playingIndex
            });
            this.videoParams = params;
            this.lastUpdateTime = nowTime;
        }
    }

    public updateHistory(history: Partial<PlayHistory>) {
        setHistory(this.props, history);
    }

    public onPlayEnd() {
        const { playingIndex } = this.state;
        if (playingIndex < this.activeSource.urls.length - 1) {
            this.setPlayingIndex(playingIndex + 1)
        }
    }

    public setPlayingIndex(indexOrSetter: number | ((prev: number) => number)) {
        this.setState(
            typeof indexOrSetter === 'number' ? { playingIndex: indexOrSetter } : state => ({
                playingIndex: indexOrSetter(state.playingIndex)
            })
        )
        this.updateHistory({
            episodeIndex: typeof indexOrSetter === 'number' ? indexOrSetter : indexOrSetter(this.state.playingIndex)
        })
        this.videoParams = null;
    }

    public get playingVideoTitle() {
        return this.props.video.name + ' - ' + this.playingVideo.label
    }

    public get pageTitle() {
        if (this.props.video) {
            return this.props.video.name
        }
        return '数据解析错误'
    }

    public render(): React.ReactNode {

        const { video } = this.props;

        return (
            <Box sx={{
                height: '100%',
                backgroundImage: 'var(--linear-gradient-image)'
            }}>
                <title>{this.pageTitle}</title>
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
                            <Box sx={
                                (theme) => ({
                                    display: 'flex',
                                    flexDirection: 'column',
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
                                    <VideoUrlParser url={this.playingVideo.url}>
                                        {
                                            (url) => (
                                                <VideoPlayer
                                                    ref={this.videoRef}
                                                    title={this.playingVideoTitle}
                                                    url={getParamsUrl('/api/video/m3u8-pure', { url })}
                                                    hls
                                                    autoplay
                                                    initPlayTime={this.videoParams ? this.videoParams.seek : 0}
                                                    onTimeUpdate={this.onPlaying.bind(this)}
                                                    onNext={
                                                        this.isLastVideo ? null : () => this.setPlayingIndex(prev => prev + 1)
                                                    }
                                                    onEnd={this.onPlayEnd.bind(this)}
                                                />
                                            )
                                        }
                                    </VideoUrlParser>
                                </Box>
                                {
                                    this.activeSource.urls.length > 1 && (
                                        <Box sx={{
                                            position: 'relative',
                                            bgcolor: 'background.paper',
                                            p: 1.5
                                        }}>
                                            <Typography
                                                variant="subtitle1"
                                                align="center"
                                                sx={{
                                                    position: 'relative',
                                                    zIndex: 2
                                                }}
                                            >{this.playingVideoTitle}</Typography>
                                        </Box>
                                    )
                                }
                                <Box sx={(theme) => ({
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flexGrow: 1,
                                    [theme.breakpoints.only('xs')]: {
                                        overflow: 'hidden'
                                    }
                                })}>
                                    <Box sx={{
                                        width: '100%',
                                        bgcolor: 'background.paper',
                                        borderBottom: 1,
                                        borderColor: 'divider'
                                    }}>
                                        <Tabs value={this.state.activeView} onChange={
                                            (_event, active: number) => {
                                                this.setState({
                                                    activeView: active
                                                })
                                            }
                                        } centered>
                                            <Tab label="简介" />
                                            <Tab label="选集" />
                                            <Tab label="同类推荐" />
                                        </Tabs>
                                    </Box>
                                    <TabPanel index={0} value={this.state.activeView}>
                                        <VideoProfile video={video} />
                                    </TabPanel>
                                    <TabPanel index={1} value={this.state.activeView} disablePadding>
                                        <Box sx={(theme) => ({
                                            display: 'flex',
                                            flexDirection: 'row',
                                            height: '100%',
                                            py: 1.5,
                                            [theme.breakpoints.up('sm')]: {
                                                minHeight: 250
                                            }
                                        })}>
                                            {
                                                video.dataList.length > 1 && (
                                                    <Tabs sx={{
                                                        borderRight: 1,
                                                        borderColor: 'divider',
                                                        flexShrink: 0
                                                    }} orientation="vertical" variant="scrollable" value={this.state.activeSource} onChange={
                                                        (_event, active: number) => {
                                                            this.updateHistory({
                                                                sourceIndex: active
                                                            })
                                                            this.setState({
                                                                activeSource: active
                                                            })
                                                        }
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
                                            <Box sx={(theme) => ({
                                                width: '100%',
                                                [theme.breakpoints.only('xs')]: {
                                                    flexGrow: 1,
                                                    overflowY: 'auto'
                                                }
                                            })}>
                                                {
                                                    video.dataList.map(
                                                        (source: VideoSource, index: number) => (
                                                            <TabPanel index={index} value={this.state.activeSource} key={index} disablePadding>
                                                                <Box sx={(theme) => ({
                                                                    display: 'flex',
                                                                    flexFlow: 'row wrap',
                                                                    flexGrow: 1,
                                                                    px: 1.5,
                                                                    [theme.breakpoints.only('xs')]: {
                                                                        overflowY: 'auto'
                                                                    }
                                                                })}>
                                                                    {
                                                                        source.urls.map(
                                                                            (video: VideoItem, index: number) => (
                                                                                <Box className={css.cell} key={index}>
                                                                                    <Button fullWidth disableElevation variant={
                                                                                        this.state.playingIndex === index ? 'contained' : 'outlined'
                                                                                    } sx={{
                                                                                        whiteSpace: 'nowrap'
                                                                                    }} size="small" onClick={
                                                                                        () => {
                                                                                            if (this.state.playingIndex !== index) {
                                                                                                this.setPlayingIndex(index);
                                                                                            }
                                                                                        }
                                                                                    }>{video.label}</Button>
                                                                                </Box>
                                                                            )
                                                                        )
                                                                    }
                                                                </Box>
                                                            </TabPanel>
                                                        )
                                                    )
                                                }
                                            </Box>
                                        </Box>
                                    </TabPanel>
                                    <TabPanel index={2} value={this.state.activeView} disablePadding>
                                        <Box sx={{
                                            height: '100%',
                                            p: 1.5,
                                            overflowY: 'auto'
                                        }}>
                                            <RelatedList data={video.related} />
                                        </Box>
                                    </TabPanel>
                                </Box>
                            </Box>
                        </Box>
                    ) : (
                        <NoData text="💔 数据解析错误.." />
                    )
                }
            </Box>
        )
    }
}

interface VideoProfileProps {
    video: VideoInfo;
}

function VideoProfile({ video }: VideoProfileProps) {

    return (
        <Box sx={(theme) => ({
            display: 'flex',
            height: '100%',
            [theme.breakpoints.only('xs')]: {
                overflowY: 'auto',
            }
        })}>
            <Box sx={(theme) => ({
                width: '36%',
                aspectRatio: '2 / 3',
                flexShrink: 0,
                [theme.breakpoints.up('sm')]: {
                    width: 180
                },
                mr: 1.5
            })}>
                <ThumbLoader
                    src={proxyUrl(video.pic)}
                />
            </Box>
            <Box>
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
                <Box dangerouslySetInnerHTML={{
                    __html: video.des
                }} />
            </Box>
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
                                            width: 90,
                                            height: 120,
                                            flexShrink: 0
                                        }}>
                                            <ThumbLoader
                                                src={`/api/video/${id}?type=poster&proxy=1`}
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

    const { id } = serverData;
    const [videoInfo, setVideoInfo] = useState<VideoInfo>();

    useEffect(() => {
        (async function getVideoInfo() {
            try {
                const { code, data } = await getJson<ApiJsonType<VideoInfo>>(`/api/video/${id}`)
                if (code === 0) {
                    setVideoInfo(data)
                }
                else {
                    throw new Error('request failed')
                }
            }
            catch (err) {
                console.error('💔 Get data error: ' + err)
                setTimeout(getVideoInfo, 1e3);
            }
        })()
    }, [])
    return videoInfo ? (
        <VideoDetail
            id={id}
            video={videoInfo}
        />
    ) : (
        <LoadingScreen />
    )
}
