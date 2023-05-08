import React, { Component, useState, useEffect, useMemo } from 'react';
import type { PageProps } from 'gatsby';
import fetch from 'node-fetch';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import loadable from '@loadable/component';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ThumbLoader from '../../../../components/search/ThumbLoader';
import { LoadingScreen } from '../../../../components/loading';
import BackgroundContainer from '../../../../components/layout/BackgroundContainer';
import NoData from '../../../../components/search/NoData';
import VideoUrlParser from '../../../../components/search/VideoUrlParser';
import { PlayState } from '../../../../components/player/VideoPlayer';
import * as css from './style.module.css';

const VideoPlayer = loadable(() => import('../../../../components/player/VideoPlayer'))

interface TabPanelProps extends React.PropsWithChildren<{
    index: number;
    value: number;
}> { }

interface VideoParams {
    seek: number;
}

function TabPanel({ index, value, children }: TabPanelProps) {
    if (index === value) {
        return (
            <Box sx={{
                width: '100%',
                flexGrow: 1,
                p: 1,
                bgcolor: 'background.default',
                overflow: 'hidden',
            }}>{children}</Box>
        )
    }
    return null;
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

function getStoreKey(api: string, id: string) {
    return `${api}_${id}`;
}

function getHistory({ api, id }: VideoDetailProps): PlayHistory {
    const params = createVideoParams();
    const defaultHistory: PlayHistory = {
        params,
        episodeIndex: 0,
        sourceIndex: 0
    };
    const key = getStoreKey(api, id);
    const store = localStorage.getItem(key);
    return store ? JSON.parse(store) : defaultHistory;
}

function setHistory({ api, id }: VideoDetailProps, history: Partial<PlayHistory>): void {
    const key = getStoreKey(api, id);
    const store = localStorage.getItem(key);
    localStorage.setItem(key, JSON.stringify({
        ...(store ? JSON.parse(store) : null),
        ...history
    }))
}

interface VideoDetailProps {
    api: string;
    id: string;
    video: VideoInfo;
}

interface VideoDetailState {
    activeView: number; /* 0 简介, 1 选集 */
    activeSource: number;
    playingIndex: number;
    isCollected: boolean;
}

class VideoDetail extends Component<VideoDetailProps, VideoDetailState> {

    public videoParams?: VideoParams;
    public lastUpdateTime = 0;

    state: VideoDetailState = {
        activeView: 0,
        activeSource: 0,
        playingIndex: null,
        isCollected: false
    }

    constructor(props: VideoDetailProps) {

        super(props);

        const { params, sourceIndex: activeSource = 0, episodeIndex } = getHistory(this.props);
        this.state.activeSource = activeSource;
        this.state.playingIndex = episodeIndex;
        this.videoParams = params;
        this.lastUpdateTime = +new Date();
    }

    componentDidMount() {
        const { params, sourceIndex: activeSource = 0, episodeIndex } = getHistory(this.props);
        this.setState({
            activeSource
        })
        this.setPlayingIndex(episodeIndex, true);
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

    public get playingUrl() {
        return this.playingVideo.url
    }

    public get isFirstVideo() {
        return this.state.playingIndex === 0
    }

    public get prevVideoTitle() {
        if (this.isFirstVideo) {
            return '上一集'
        }
        return this.activeSource.urls[this.state.playingIndex - 1].label
    }

    public get nextVideoTitle() {
        if (this.isLastVideo) {
            return '下一集'
        }
        return this.activeSource.urls[this.state.playingIndex + 1].label
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

    public setPlayingIndex(indexOrSetter: number | ((prev: number) => number), init = false) {
        this.setState(
            typeof indexOrSetter === 'number' ? { playingIndex: indexOrSetter } : state => ({
                playingIndex: indexOrSetter(state.playingIndex)
            })
        )
        if (!init) {
            this.updateHistory({
                episodeIndex: typeof indexOrSetter === 'number' ? indexOrSetter : indexOrSetter(this.state.playingIndex)
            })
            this.videoParams = null;
        }
    }

    public get pageTitle() {
        if (this.props.video) {
            return this.props.video.name
        }
        return '数据解析错误'
    }

    public render(): React.ReactNode {
        return (
            <Box sx={{
                height: '100%',
                backgroundImage: 'var(--linear-gradient-image)'
            }}>
                <title>{this.pageTitle}</title>
                {
                    this.props.video ? (
                        <BackgroundContainer>
                            <Box className={css.container}>
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
                                        width: '100%',
                                        height: '45%',
                                        flexShrink: 0,
                                        [theme.breakpoints.up('sm')]: {
                                            height: 'min(calc(min(100vw, 1200px) * 10 / 16), 600px)',
                                            maxHeight: '100vh'
                                        }
                                    })}>
                                        <VideoUrlParser url={this.playingUrl}>
                                            {
                                                url => (
                                                    <VideoPlayer
                                                        url={url}
                                                        hls
                                                        autoplay
                                                        initPlayTime={this.videoParams ? this.videoParams.seek : 0}
                                                        onTimeUpdate={this.onPlaying.bind(this)}
                                                        onEnd={this.onPlayEnd.bind(this)}
                                                    />
                                                )
                                            }
                                        </VideoUrlParser>
                                    </Box>
                                    {
                                        this.activeSource.urls.length > 1 && (
                                            <Box sx={{
                                                backdropFilter: 'blur(15px)',
                                                color: '#fff',
                                            }}>
                                                <Box sx={{
                                                    display: {
                                                        xs: 'inherit',
                                                        sm: 'none'
                                                    },
                                                }}>
                                                    <Box sx={{
                                                        p: 1
                                                    }}>
                                                        <Typography variant="subtitle1">{this.props.video.name} - {this.playingVideo.label}</Typography>
                                                    </Box>
                                                    <Divider sx={{
                                                        mx: 1
                                                    }} variant="middle" />
                                                </Box>
                                                <Stack
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                    direction="row"
                                                    columnGap={1}
                                                    sx={{
                                                        p: 1
                                                    }}
                                                >
                                                    <Button startIcon={
                                                        <SkipPreviousIcon />
                                                    } variant="contained" disabled={this.isFirstVideo} onClick={
                                                        () => this.setPlayingIndex(prev => prev - 1)
                                                    } sx={{
                                                        flexShrink: 0,
                                                        mr: 2,
                                                        visibility: this.isFirstVideo ? 'hidden' : 'visible',
                                                    }} size="small">{this.prevVideoTitle}</Button>
                                                    <Typography textAlign="center" variant="subtitle1" sx={{
                                                        display: {
                                                            xs: 'none',
                                                            sm: 'inherit'
                                                        },
                                                    }}>
                                                        正在播放: {this.props.video.name} - {this.playingVideo.label}
                                                    </Typography>
                                                    <Button endIcon={
                                                        <SkipNextIcon />
                                                    } variant="contained" disabled={this.isLastVideo} onClick={
                                                        () => this.setPlayingIndex(prev => prev + 1)
                                                    } sx={{
                                                        flexShrink: 0,
                                                        ml: 2,
                                                        visibility: this.isLastVideo ? 'hidden' : 'visible',
                                                    }} size="small">{this.nextVideoTitle}</Button>
                                                </Stack>
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
                                                (_event: React.SyntheticEvent, active: number) => {
                                                    this.setState({
                                                        activeView: active
                                                    })
                                                }
                                            } centered>
                                                <Tab label="简介" />
                                                <Tab label="选集" />
                                            </Tabs>
                                        </Box>
                                        <TabPanel index={0} value={this.state.activeView}>
                                            <VideoSummary video={this.props.video} />
                                        </TabPanel>
                                        <TabPanel index={1} value={this.state.activeView}>
                                            <Box sx={(theme) => ({
                                                display: 'flex',
                                                flexDirection: 'row',
                                                height: '100%',
                                                [theme.breakpoints.up('sm')]: {
                                                    minHeight: 250
                                                }
                                            })}>
                                                {
                                                    this.props.video.dataList.length > 1 && (
                                                        <Tabs sx={{
                                                            borderRight: 1,
                                                            borderColor: 'divider',
                                                            flexShrink: 0
                                                        }} orientation="vertical" variant="scrollable" value={this.state.activeSource} onChange={
                                                            (_event: React.SyntheticEvent, active: number) => {
                                                                this.updateHistory({
                                                                    sourceIndex: active
                                                                })
                                                                this.setState({
                                                                    activeSource: active
                                                                })
                                                            }
                                                        }>
                                                            {
                                                                this.props.video.dataList.map(
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
                                                        this.props.video.dataList.map(
                                                            (source: VideoSource, index: number) => (
                                                                <TabPanel index={index} value={this.state.activeSource} key={index}>
                                                                    <Box sx={(theme) => ({
                                                                        display: 'flex',
                                                                        flexFlow: 'row wrap',
                                                                        flexGrow: 1,
                                                                        [theme.breakpoints.only('xs')]: {
                                                                            overflowY: 'auto'
                                                                        }
                                                                    })}>
                                                                        {
                                                                            source.urls.map(
                                                                                (video: VideoItem, index: number) => (
                                                                                    <div className={css.cell} key={index}>
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
                                                                                    </div>
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
                                    </Box>
                                </Box>
                            </Box>
                        </BackgroundContainer>
                    ) : (
                        <NoData text="💔 数据解析错误.." />
                    )
                }
            </Box>
        )
    }
}

interface VideoSummaryProps {
    video: VideoInfo;
}

function VideoSummary({ video }: VideoSummaryProps) {

    const videoPoster = useMemo(
        () => (
            <ThumbLoader
                src={video.pic}
                alt={video.name}
            />
        ),
        [video.pic]
    )

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
                }
            })}>
                {videoPoster}
            </Box>
            <Box sx={{
                ml: 1.5
            }}>
                <Typography variant="h5" lineHeight={1.2}>{video.name}</Typography>
                <Typography variant="body1" gutterBottom>{video.note}</Typography>
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

export async function getServerData({ params }: PageProps<object, object, unknown, unknown>) {
    const { api, id } = params as Record<'api' | 'id', string>;
    return {
        status: 200,
        headers: {
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin'
        },
        props: {
            api,
            id
        }
    }
}

export default function Page({ serverData }: PageProps<object, object, unknown, { api: string; id: string }>) {

    const { api, id } = serverData;
    const [video, setVideo] = useState<VideoInfo>();

    useEffect(() => {
        (async function getVideoInfo() {
            try {
                const { code, data } = await fetch(`/api/video/${api}/${id}`).then<ApiJsonType<VideoInfo>>(
                    response => response.json()
                )
                if (code === 0) {
                    setVideo(data)
                }
            }
            catch (err) {
                console.error('💔 Get data error: ' + err)
                setTimeout(getVideoInfo, 1e3);
            }
        })()
    }, [])
    return video ? (
        <VideoDetail
            api={api}
            id={id}
            video={video}
        />
    ) : (
        <LoadingScreen />
    )
}
