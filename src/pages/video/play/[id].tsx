import React, { Component, useState, useEffect, createRef } from 'react';
import type { PageProps, GetServerDataProps, GetServerDataReturn } from 'gatsby';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabPanel from '../../../components/layout/TabPanel';
import ThumbLoader from '../../../components/search/ThumbLoader';
import { LoadingScreen } from '../../../components/loading';
import NoData from '../../../components/search/NoData';
import { getJson } from '../../../adaptors/common';
import VideoUrlParser from '../../../components/search/VideoUrlParser';
import { VideoPlayer, type PlayState } from '../../../components/player';
import * as css from './style.module.css';

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
    isCollected: boolean;
}

class VideoDetail extends Component<VideoDetailProps, VideoDetailState> {

    public videoParams?: VideoParams;
    private lastUpdateTime = 0;
    public videoRef = createRef<HTMLVideoElement>()

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
        return (
            <Box sx={{
                height: '100%',
                backgroundImage: 'var(--linear-gradient-image)'
            }}>
                <title>{this.pageTitle}</title>
                {
                    this.props.video ? (
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
                                    <VideoUrlParser url={this.playingVideo.url}>
                                        {
                                            url => (
                                                <VideoPlayer
                                                    ref={this.videoRef}
                                                    title={this.playingVideoTitle}
                                                    url={url}
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
                                            color: '#fff',
                                            p: 1.5
                                        }}>
                                            <Typography variant="subtitle1" align="center">{this.playingVideoTitle}</Typography>
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
                    src={`/api/proxy?url=${video.pic}`}
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

type ServerProps = {
    id: string;
}

export async function getServerData({ params }: GetServerDataProps): Promise<GetServerDataReturn<ServerProps>> {
    const { id } = params as ServerProps;
    return {
        status: 200,
        headers: {
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin'
        },
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
