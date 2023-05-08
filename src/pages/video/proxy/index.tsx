import React, { useState, useEffect, useRef } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Pagination from '@mui/material/Pagination';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import { StaticTheme } from '../../../components/theme';
import SearchForm from '../../../components/search/Form';
import BackgroundContainer from '../../../components/layout/BackgroundContainer';
import { LoadingOverlay } from '../../../components/loading';
import ThumbLoader from '../../../components/search/ThumbLoader';
import RowClipTypography from '../../../components/layout/element/RowClipTypography';
import useErrorMessage, { SnackbarProvider } from '../../../components/hook/useErrorMessage';
import NoData from '../../../components/search/NoData';
import createTransition from '../../../components/transition/Slide';
import loadable from '@loadable/component';

const Transition = createTransition()

const VideoPlayer = loadable(() => import('../../../components/player/VideoPlayer'))

interface PagedSearchTask<T> extends SearchTask<T> {
    total: number;
    page: number;
}

function Proxy() {

    const [keyword, setKeyword] = useState('')
    const [searchTask, setSearchTask] = useState<PagedSearchTask<ProxyVideo.ParsedVideo>>({
        keyword: '',
        data: [],
        pending: false,
        complete: false,
        success: false,
        total: 0,
        page: 1
    })
    const scrollerRef = useRef<HTMLDivElement>()
    const [playingVideo, setPlayingVideo] = useState<{
        title: string;
        url: string;
    }>(null)
    const showErrorMessage = useErrorMessage()

    const handleSubmit = (keyword: string) => {
        setSearchTask(
            t => ({
                ...t,
                keyword,
                page: 1
            })
        )
    }

    const parseVideo = async ({ id, title }: ProxyVideo.ParsedVideo) => {
        setSearchTask(
            t => ({
                ...t,
                pending: true
            })
        )
        try {
            const { code, data, msg } = await fetch(`/api/video/proxy/parse?id=${id}`).then<ApiJsonType<string>>(
                response => response.json()
            )
            if (code === 0) {
                setPlayingVideo({
                    title,
                    url: data
                })
                window.location.href = window.location.pathname + window.location.search + '#pop'
            }
            else {
                throw new Error(`Error: ${msg}`)
            }
        }
        catch (err) {
            showErrorMessage({
                message: '视频地址解析失败'
            })
        }
        setSearchTask(
            t => ({
                ...t,
                pending: false
            })
        )
    }

    const getSearch = async () => {
        const searchParams = new URLSearchParams()
        if (keyword !== '') {
            searchParams.set('s', keyword)
        }
        if (searchTask.page > 1) {
            searchParams.set('p', String(searchTask.page))
        }
        setSearchTask(
            t => ({
                ...t,
                pending: true
            })
        )
        try {
            const { code, data, msg } = await fetch(`/api/video/proxy?${searchParams}`).then<ApiJsonType<ProxyVideo.ParsedResult>>(
                response => response.json()
            )
            if (code === 0) {
                const { list, total } = data;
                setSearchTask(
                    t => ({
                        ...t,
                        data: list,
                        complete: true,
                        total
                    })
                )
            }
            else {
                throw new Error(`Error: ${msg}`)
            }
        }
        catch (err) {
            showErrorMessage({
                message: '数据获取失败'
            })
        }
        setSearchTask(
            t => ({
                ...t,
                pending: false
            })
        )
    }

    useEffect(() => {
        getSearch()
    }, [searchTask.keyword, searchTask.page])

    const handlePopState = (_ev: PopStateEvent) => {
        setPlayingVideo(null)
    }

    useEffect(() => {

        if (playingVideo) {
            window.addEventListener('popstate', handlePopState)
        }

        return () => {
            if (playingVideo) {
                window.removeEventListener('popstate', handlePopState)
            }
        }
    }, [playingVideo])

    useEffect(() => {
        scrollerRef.current?.scrollTo(0, 0)
    }, [searchTask.data])

    return (
        <StaticTheme>
            <BackgroundContainer style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }} prefer18>
                <Stack sx={{
                    position: 'relative',
                    zIndex: 100,
                    p: 1.5
                }} direction="row" justifyContent="center">
                    <Box sx={
                        (theme) => ({
                            width: '100%',
                            [theme.breakpoints.up('sm')]: {
                                width: 300
                            }
                        })
                    }>
                        <SearchForm
                            value={keyword}
                            onChange={setKeyword}
                            onSubmit={handleSubmit}
                            autocompleteKey="proxy_video"
                        />
                    </Box>
                </Stack>
                {
                    searchTask.complete && (
                        searchTask.data.length > 0 ? (
                            <Stack sx={{
                                position: 'relative',
                                zIndex: 90,
                                overflow: 'hidden'
                            }} flexGrow={1}>
                                <Box ref={scrollerRef} sx={{
                                    flexGrow: 1,
                                    px: 1.5,
                                    overflowY: 'auto'
                                }}>
                                    <Grid spacing={2} container>
                                        {
                                            searchTask.data.map(
                                                (video) => (
                                                    <Grid xs={12} sm={6} lg={3} key={video.id} item>
                                                        <Card sx={{
                                                            bgcolor: 'background.paper'
                                                        }} elevation={2}>
                                                            <CardActionArea onClick={
                                                                () => parseVideo(video)
                                                            }>
                                                                <Stack direction="row">
                                                                    <Box sx={{
                                                                        width: 125,
                                                                        height: 180,
                                                                        flexShrink: 0
                                                                    }}>
                                                                        <ThumbLoader
                                                                            src={video.poster}
                                                                            aspectRatio="125 / 180"
                                                                            alt={video.title}
                                                                        />
                                                                    </Box>
                                                                    <Box sx={{
                                                                        flexGrow: 1,
                                                                        p: 1.5,
                                                                        overflow: 'hidden'
                                                                    }}>
                                                                        <Stack sx={{
                                                                            height: '100%',
                                                                            justifyContent: 'space-between'
                                                                        }}>
                                                                            <Tooltip title={video.title}>
                                                                                <Box>
                                                                                    <RowClipTypography
                                                                                        lineHeight={1.2}
                                                                                        rows={4}
                                                                                        variant="h5"
                                                                                        paragraph
                                                                                    >{video.title}</RowClipTypography>
                                                                                </Box>
                                                                            </Tooltip>
                                                                            <Typography variant="subtitle2" color="text.secondary" align="right">{video.createTime}</Typography>
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
                                </Box>
                                <Stack sx={{
                                    px: 1,
                                    py: 2
                                }} direction="row" justifyContent="center">
                                    <Pagination
                                        page={searchTask.page}
                                        count={searchTask.total}
                                        variant="outlined"
                                        color="primary"
                                        onChange={
                                            (_event: React.ChangeEvent<unknown>, page: number) => {
                                                setSearchTask(
                                                    t => ({
                                                        ...t,
                                                        page
                                                    })
                                                );
                                            }
                                        }
                                    />
                                </Stack>
                            </Stack>
                        ) : (
                            <Stack sx={{
                                position: 'relative',
                                zIndex: 5,
                                flexGrow: 1
                            }}>
                                <NoData />
                            </Stack>
                        )
                    )
                }
                <Dialog
                    fullScreen
                    open={Boolean(playingVideo)}
                    TransitionComponent={Transition}
                >
                    <AppBar color="transparent" elevation={0}>
                        <Toolbar sx={{
                            color: '#fff'
                        }}>
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={() => history.back()}
                                aria-label="close"
                            >
                                <CloseIcon />
                            </IconButton>
                            <Typography
                                sx={{
                                    ml: 2,
                                    flex: 1,
                                    width: '100%',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                                color="#fff"
                                variant="h6"
                                component="div">{playingVideo?.title}</Typography>
                        </Toolbar>
                    </AppBar>
                    {
                        playingVideo && (
                            <VideoPlayer
                                url={playingVideo.url}
                                autoplay
                                onEnd={() => history.back()}
                            />
                        )
                    }
                </Dialog>
                <LoadingOverlay
                    open={searchTask.pending}
                    label="加载中..."
                    labelColor="#fff"
                    withBackground
                />
            </BackgroundContainer>
        </StaticTheme>
    )
}

export function Head() {
    return (
        <title>Proxy video</title>
    )
}

export default function Page() {
    return (
        <SnackbarProvider>
            <Proxy />
        </SnackbarProvider>
    )
}
