import React, { useState, useEffect, useMemo, useRef } from 'react';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertProps } from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import SearchForm from '../../components/search/Form';
import { LoadingOverlay } from '../../components/loading';
import MusicPlayer, { type SearchMusic, type PlayingMusic, RepeatMode } from '../../components/player/MusicPlayer';
import NoData from '../../components/search/NoData';
import SongList from '../../components/search/SongList';
import MusicPlayList from '../../components/player/MusicPlayList';
import useLocalStorageState from '../../components/hook/useLocalStorageState';

export default function MusicSearch() {

    const [keyword, setKeyword] = useState('')
    const [toastMsg, setToastMsg] = useState<ToastMsg<AlertProps['severity']>>(null)
    const [searchTask, setSearchTask] = useState<SearchTask<SearchMusic>>({
        data: [],
        pending: false,
        complete: false,
        success: false
    })

    const [activeMusic, setActiveMusic] = useState<PlayingMusic>()
    const [playing, setPlaying] = useState(false)

    const [playlistShow, setPlaylistShow] = useState(false)
    const [repeat, setRepeat] = useLocalStorageState<RepeatMode>('__repeat_mode', RepeatMode.All)

    const [playlist, setPlaylist] = useLocalStorageState<PlayingMusic[]>('__playlist', [])
    const songListWrapRef = useRef<HTMLDivElement>()

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setToastMsg(null);
    }

    const generateRandomIndex = (max: number, current: number) => {
        const random = Math.round(Math.random() * max);
        if (random === current) {
            return generateRandomIndex(max, current)
        }
        return random;
    }

    const onSearch = async (s: string) => {
        if (s.trim().length === 0) {
            setToastMsg({
                type: 'warning',
                msg: '关键词不能为空'
            })
            return;
        }
        setSearchTask(t => ({
            ...t,
            complete: false,
            pending: true
        }))
        let success = false;
        let data = null;
        const list = await getSearch(s)
        if (list) {
            data = list;
            success = true;
        }
        else {
            success = false;
            setToastMsg({
                type: 'error',
                msg: '获取歌曲列表失败'
            })
        }
        setSearchTask({
            pending: false,
            complete: true,
            success,
            data
        })
    }

    useEffect(() => {
        if (playlist.init && playlist.data.length > 0) {
            setActiveMusic(playlist.data[0])
        }
    }, [playlist])

    useEffect(() => {
        if (searchTask.success && searchTask.data.length > 0) {
            songListWrapRef.current.scrollTo({
                top: 0,
                behavior: 'auto'
            })
        }
    }, [searchTask.success, searchTask.data])

    const downloadSong = ({ id, name, artist }: SearchMusic) => {
        const searchParams = new URLSearchParams({
            name: encodeURIComponent(`${artist}-${name}`)
        })
        window.open(
            `/api/music/download/${id}?${searchParams}`
        )
    }

    const pageTitle = useMemo(() => {
        if (activeMusic) {
            return `🎵 ${activeMusic.name} - ${activeMusic.artist} ${playing ? '⏸' : '▶'}`;
        }
        return '音乐搜索';
    }, [activeMusic, playing])

    useEffect(() => {
        if (!activeMusic) {
            setPlaylistShow(false)
        }
    }, [activeMusic])

    return (
        <Stack sx={{
            height: '100%',
            backgroundImage: 'var(--linear-gradient-image)'
        }} direction="column">
            <title>{pageTitle}</title>
            <Stack sx={{
                position: 'absolute',
                width: '100%',
                zIndex: 150,
                p: 1.5
            }} direction="row" justifyContent="center">
                <Box sx={(theme) => ({
                    width: '100%',
                    [theme.breakpoints.up('sm')]: {
                        maxWidth: 320
                    }
                })}>
                    <SearchForm
                        value={keyword}
                        onChange={setKeyword}
                        onSubmit={onSearch}
                        loading={searchTask.pending}
                    />
                </Box>
            </Stack>
            <Box sx={(theme) => ({
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                maxWidth: 600,
                margin: '0 auto',
                [theme.breakpoints.up('sm')]: {
                    backgroundImage: activeMusic ? 'linear-gradient(0, #00000066, transparent)' : 'none'
                }
            })}>
                {
                    searchTask.success ? (
                        <Box sx={{
                            flexGrow: 1,
                            overflow: 'hidden',
                            pt: 9
                        }}>
                            {
                                searchTask.data.length > 0 ? (
                                    <Box sx={(theme) => ({
                                        height: '100%',
                                        px: 1.5,
                                        overflowY: 'auto',
                                        pb: activeMusic ? 13 : 2,
                                        [theme.breakpoints.up('sm')]: {
                                            pb: activeMusic ? 14 : 2
                                        }
                                    })} ref={songListWrapRef}>
                                        <SongList
                                            data={searchTask.data}
                                            isCurrentPlaying={(music: SearchMusic) => ({
                                                isCurrent: activeMusic && activeMusic.id === music.id,
                                                playing
                                            })}
                                            onTogglePlay={
                                                async (music: SearchMusic) => {
                                                    if (activeMusic && music.id === activeMusic.id) {
                                                        setPlaying(
                                                            state => !state
                                                        )
                                                    }
                                                    else {
                                                        const playIndex = playlist.data.findIndex(
                                                            m => m.id === music.id
                                                        )
                                                        if (playIndex === -1) {
                                                            setActiveMusic(music)
                                                            setPlaylist(list => [music, ...list])
                                                        }
                                                        else {
                                                            setActiveMusic(playlist.data[playIndex])
                                                        }
                                                    }
                                                }
                                            }
                                            onAction={
                                                async (cmd, music) => {
                                                    const playIndex = playlist.data.findIndex(
                                                        m => m.id === music.id
                                                    )
                                                    if (playIndex !== -1 && cmd === 'add') {
                                                        setToastMsg({
                                                            type: 'warning',
                                                            msg: '当前歌曲已经在播放列表中'
                                                        })
                                                        return;
                                                    }
                                                    switch (cmd) {
                                                        case 'add':
                                                            setPlaylist(list => [...list, music])
                                                            if (playlist.data.length === 0) {
                                                                setActiveMusic(music)
                                                            }
                                                            setToastMsg({
                                                                type: 'success',
                                                                msg: '已加入播放列表'
                                                            })
                                                            break;
                                                        case 'download':
                                                            downloadSong(music)
                                                            break;
                                                        default:
                                                            break;
                                                    }
                                                }
                                            }
                                        />
                                    </Box>
                                ) : (
                                    <NoData text='💔 没有找到相关的音乐, 换个关键词试试吧' />
                                )
                            }
                        </Box>
                    ) : (
                        !searchTask.pending && (
                            <Stack sx={{
                                position: 'relative',
                                zIndex: 120
                            }} flexGrow={1} justifyContent="center" alignItems="center">
                                <Typography variant="body1" color="hsl(270, 100%, 100%)">🔍 输入歌名/歌手名开始搜索</Typography>
                            </Stack>
                        )
                    )
                }
                <Slide direction="up" in={Boolean(activeMusic)} mountOnEnter unmountOnExit>
                    <Stack sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        boxShadow: '0px -4px 12px 0px rgb(0 0 0 / 80%)',
                        maxHeight: '60%',
                        zIndex: 1250
                    }}>
                        <MusicPlayer
                            music={activeMusic}
                            playing={playing}
                            onPlayStateChange={setPlaying}
                            onTogglePlayList={
                                () => setPlaylistShow(
                                    show => !show
                                )
                            }
                            repeat={repeat.data}
                            onRepeatChange={setRepeat}
                            onPlayEnd={
                                async (end) => {
                                    if (!end) {
                                        setToastMsg({
                                            type: 'error',
                                            msg: `“${activeMusic.name}”播放错误`
                                        })
                                    }
                                    const playIndex = playlist.data.findIndex(
                                        music => music.id === activeMusic.id
                                    );
                                    switch (repeat.data) {
                                        case RepeatMode.Random:
                                            if (playlist.data.length > 1) {
                                                const nextPlayIndex = generateRandomIndex(playlist.data.length - 1, playIndex)
                                                setActiveMusic(playlist.data[nextPlayIndex])
                                            }
                                            break;
                                        case RepeatMode.All:
                                            if (playIndex < playlist.data.length - 1) {
                                                setActiveMusic(playlist.data[playIndex + 1])
                                            }
                                            else {
                                                setActiveMusic(playlist.data[0])
                                            }
                                    }
                                }
                            }
                        />
                        {
                            playlistShow && (
                                <MusicPlayList
                                    data={playlist.data}
                                    onChange={setPlaylist}
                                    current={activeMusic}
                                    playing={playing}
                                    onPlay={
                                        (music) => {
                                            if (!music) {
                                                setPlaying(false)
                                            }
                                            setActiveMusic(music)
                                        }
                                    }
                                    onTogglePlay={
                                        () => {
                                            setPlaying(playing => !playing)
                                        }
                                    }
                                    onSearch={
                                        (s) => {
                                            setKeyword(s)
                                            onSearch(s)
                                        }
                                    }
                                    onDownload={downloadSong}
                                />
                            )
                        }
                    </Stack>
                </Slide>
                <LoadingOverlay
                    open={searchTask.pending}
                    label="搜索中.."
                    withBackground
                    labelColor="#fff"
                />
            </Box>
            <Snackbar
                open={Boolean(toastMsg)}
                autoHideDuration={5000}
                onClose={
                    () => setToastMsg(null)
                }
                anchorOrigin={{
                    horizontal: 'center',
                    vertical: 'bottom'
                }}
            >
                {
                    toastMsg && (
                        <Alert severity={toastMsg.type} onClose={handleClose}>{toastMsg.msg}</Alert>
                    )
                }
            </Snackbar>
        </Stack>
    )
}

async function getSearch(s: string): Promise<SearchMusic[] | null> {
    try {
        const { code, data } = await fetch(
            `/api/music/list?s=${encodeURIComponent(s)}`
        ).then<ApiJsonType<SearchMusic[]>>(
            response => response.json()
        );
        if (code === 0) {
            return data;
        }
        else {
            throw new Error('search failed');
        }
    }
    catch (err) {
        return null;
    }
}
