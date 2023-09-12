import React, { useState, useEffect, useMemo, useRef } from 'react';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertProps } from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Typography from '@mui/material/Typography';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import SearchForm, { type SearchFormInstance } from '../components/search/Form';
import { LoadingOverlay } from '../components/loading';
import MusicPlayer, { RepeatMode } from '../components/player/MusicPlayer';
import NoData from '../components/search/NoData';
import SongList from '../components/search/SongList';
import MusicPlayList from '../components/player/MusicPlayList';
import useLocalStorageState from '../components/hook/useLocalStorageState';
import { Api } from '../util/config';
import { getParamsUrl } from '../util/proxy';

export default function MusicSearch() {

    const [keyword, setKeyword] = useState('')
    const [toastMsg, setToastMsg] = useState<ToastMsg<AlertProps['severity']>>(null)
    const [searchTask, setSearchTask] = useState<SearchTask<SearchMusic>>({
        data: [],
        pending: false,
        complete: false,
        success: false
    })
    const searchFormRef = useRef<SearchFormInstance>()

    const [activeMusic, setActiveMusic] = useState<SearchMusic>(null)
    const [playing, setPlaying] = useState(false)

    const [playlistShow, setPlaylistShow] = useState(false)
    const [repeat, setRepeat] = useLocalStorageState<RepeatMode>('__repeat_mode', RepeatMode.All)

    const [playlist, setPlaylist] = useLocalStorageState<SearchMusic[]>('__playlist', [])
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

    const generateSearchQuery = ({ name, artist }: SearchMusic) => {
        return {
            name: `${artist}-${name}`
        }
    }

    const downloadSong = (music: SearchMusic) => {
        downloaFile(
            getParamsUrl(
                `${Api.proxyServer}/api/music/download/${music.id}`,
                generateSearchQuery(music)
            )
        )
    }

    const downloadLrc = (music: SearchMusic) => {
        downloaFile(
            getParamsUrl(
                `${Api.proxyServer}/api/music/lrc/download/${music.id}`,
                generateSearchQuery(music)
            )
        )
    }

    const downloaFile = (url: string) => {
        window.open(url)
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
            <Box sx={(theme) => ({
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                '--max-width': '600px',
                maxWidth: 'var(--max-width)',
                margin: '0 auto',
                [theme.breakpoints.up('sm')]: {
                    backgroundImage: activeMusic ? 'linear-gradient(0, #0000001a, transparent)' : 'none'
                }
            })}>
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
                            ref={searchFormRef}
                            value={keyword}
                            onChange={setKeyword}
                            onSubmit={onSearch}
                            loading={searchTask.pending}
                            buttonColor="secondary"
                            autocompleteKey="music"
                        />
                    </Box>
                </Stack>
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
                                                    if (cmd === 'add-all') {
                                                        const dataList = searchTask.data.filter(
                                                            m => !playlist.data.find(
                                                                music => music.id === m.id
                                                            )
                                                        )
                                                        if (dataList.length > 0) {
                                                            setPlaylist(list => [...list, ...dataList])
                                                            if (playlist.data.length === 0) {
                                                                setActiveMusic(dataList[0])
                                                            }
                                                            setToastMsg({
                                                                type: 'success',
                                                                msg: `已将${dataList.length}首歌曲加入播放列表`
                                                            })
                                                        }
                                                        else {
                                                            setToastMsg({
                                                                type: 'warning',
                                                                msg: '所有歌曲都已在播放列表中'
                                                            })
                                                        }
                                                    }
                                                    else {
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
                                                            case 'download-song':
                                                                downloadSong(music)
                                                                break;
                                                            case 'download-lrc':
                                                                downloadLrc(music)
                                                                break;
                                                            default:
                                                                break;
                                                        }
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
                                <Typography variant="body1" color="hsla(0, 0%, 100%, .7)">🔍 输入歌名/歌手名开始搜索</Typography>
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
                        zIndex: 1250
                    }}>
                        <MusicPlayer
                            music={activeMusic}
                            playing={playing}
                            onPlayStateChange={setPlaying}
                            repeat={repeat.data}
                            extendButtons={
                                <Tooltip title="播放列表">
                                    <Badge sx={{
                                        '& .MuiBadge-badge': {
                                            top: 4,
                                            right: 4
                                        }
                                    }} color="secondary" badgeContent={playlist.data.length}>
                                        <IconButton
                                            color="inherit"
                                            size="small"
                                            onClick={
                                                () => setPlaylistShow(
                                                    show => !show
                                                )
                                            }
                                        >
                                            <PlaylistPlayIcon />
                                        </IconButton>
                                    </Badge>
                                </Tooltip>
                            }
                            onRepeatChange={setRepeat}
                            onPlayEnd={
                                async (end) => {
                                    if (!end) {
                                        setToastMsg({
                                            type: 'error',
                                            msg: `“${activeMusic.name}”播放错误`
                                        })
                                    }
                                    if (playlist.data.length > 1) {
                                        const playIndex = playlist.data.findIndex(
                                            music => music.id === activeMusic.id
                                        );
                                        switch (repeat.data) {
                                            case RepeatMode.Random:
                                                const nextPlayIndex = generateRandomIndex(playlist.data.length - 1, playIndex)
                                                setActiveMusic(playlist.data[nextPlayIndex])
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
                                    else {
                                        setPlaying(true)
                                    }
                                }
                            }
                        />
                        <MusicPlayList
                            show={playlistShow}
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
                                    searchFormRef.current?.putSuggest(s)
                                }
                            }
                            onDownload={
                                (music, type) => {
                                    if (type === 'song') {
                                        downloadSong(music)
                                    }
                                    else if (type === 'lrc') {
                                        downloadLrc(music)
                                    }
                                }
                            }
                        />
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
        const searchParams = new URLSearchParams({
            s
        })
        const { code, data } = await fetch(
            `/api/music/list?${searchParams}`
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
