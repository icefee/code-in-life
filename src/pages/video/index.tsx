import React, { Component, useMemo } from 'react';
import { PageProps, GetServerDataProps } from 'gatsby';
import fetch from 'node-fetch';
import NoSsr from '@mui/material/NoSsr';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ThumbLoader from '../../components/search/ThumbLoader';
import BackgroundContainer from '../../components/layout/BackgroundContainer';
import { type VideoItem, type VideoSource, type VideoInfo } from '../../components/search/api';
import NoData from '../../components/search/NoData';
import VideoPlayer, { type VideoParams } from '../../components/player/PlayerBase';
import { Api } from '../../util/config';
import { jsonBase64, utf82utf16 } from '../../util/parser';
import M3u8UrlParser from '../../components/search/M3u8UrlParser';
import * as css from './style.module.css';

interface TabPanelProps extends React.PropsWithChildren<{
    index: number;
    value: number;
}> { }

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

    public onPlaying(time: number) {
        const nowTime = Date.now();
        if (nowTime - this.lastUpdateTime > 3e3) {
            const { activeSource, playingIndex } = this.state;
            const params = {
                seek: time
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
                                        <M3u8UrlParser url={this.playingUrl}>
                                            {
                                                url => (
                                                    <VideoPlayer
                                                        url={url}
                                                        params={this.videoParams}
                                                        onPlaying={this.onPlaying.bind(this)}
                                                        onEnd={this.onPlayEnd.bind(this)}
                                                    />
                                                )
                                            }
                                        </M3u8UrlParser>
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
                retry={5}
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
                    video.area && <Typography variant="body1">地区:{video.area}</Typography>
                }
                {
                    video.director && <Typography variant="body1">导演:{video.director}</Typography>
                }
                {
                    video.actor && <Typography variant="body1">演员:{video.actor}</Typography>
                }
                <div dangerouslySetInnerHTML={{
                    __html: video.des
                }} />
                {/* <Typography variant="body1">最后更新:{video.last}</Typography> */}
            </Box>
        </Box>
    )
}

function parseDataUrl(s: string): VideoDetailProps {
    try {
        return JSON.parse(utf82utf16(atob(decodeURIComponent(s)))) as VideoDetailProps;
    }
    catch (err) {
        return {
            api: '',
            id: '',
            video: null
        } as VideoDetailProps;
    }
}

export default function Page({ location, serverData }: PageProps<object, object, unknown, { data: VideoDetailProps | null }>) {
    return (
        <NoSsr>
            <VideoDetail
                {...(serverData.data ?? parseDataUrl(location.hash.slice(1)))}
            />
        </NoSsr>
    )
}

export async function getServerData({ query }: GetServerDataProps) {
    const { api, id } = query;
    if (api && id) {
        try {
            const videoInfo = await fetch(`${Api.site}/video/api?api=${api}&id=${id}`).then(
                response => jsonBase64<VideoInfo>(response)
            )
            if (videoInfo) {
                return {
                    props: {
                        data: {
                            api,
                            id,
                            video: videoInfo
                        }
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
    return {
        props: {}
    }
}
