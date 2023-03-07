import React, { useState, useEffect, useMemo, useRef } from 'react';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertProps } from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import SearchForm from '../../components/search/Form';
import { LoadingOverlay } from '../../components/loading';
import MusicPlayer, { type SearchMusic, type MusicInfo, type PlayingMusic, RepeatMode } from '../../components/player/MusicPlayer';
import PlayOrPauseButton from '../../components/player/PlayOrPauseButton';
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
    const musicUrlMap = useRef<Map<number, MusicInfo>>(new Map())

    const [urlParsing, setUrlParsing] = useState(false)
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

    const getMusicInfo = async (id: SearchMusic['id']) => {
        const cachedMusicUrl = musicUrlMap.current.get(id);
        if (cachedMusicUrl) {
            return cachedMusicUrl;
        }
        setUrlParsing(true);
        let musicInfo = await parseMusic(id);
        if (musicInfo) {
            musicUrlMap.current.set(id, musicInfo);
        }
        else {
            setToastMsg({
                type: 'error',
                msg: '解析歌曲失败, 可能是网络连接问题'
            })
        }
        setUrlParsing(false)
        return musicInfo;
    }

    const generateRandomIndex = (max: number, current: number) => {
        const random = Math.round(Math.random() * max);
        if (random === current) {
            return generateRandomIndex(max, current)
        }
        return random;
    }

    const onSearch = async (s: string) => {
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

    const downloadSong = (music: SearchMusic & Pick<MusicInfo, 'url'>) => {
        window.open(
            `/api/music/download?name=${encodeURIComponent(`${music.artist}-${music.name}`)}&id=${btoa(music.url)}`
        )
    }

    const pageTitle = useMemo(() => {
        if (activeMusic) {
            return `🎵 ${activeMusic.name} - ${activeMusic.artist} ${playing ? '⏸' : '▶'}`;
        }
        return '音乐搜索';
    }, [activeMusic, playing])

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
                                            playButton={
                                                (music) => {
                                                    const isCurrentPlaying = activeMusic && activeMusic.id === music.id && playing;
                                                    return (
                                                        <Tooltip title={isCurrentPlaying ? '暂停当前播放的音乐' : '试听歌曲'}>
                                                            <PlayOrPauseButton
                                                                playing={isCurrentPlaying}
                                                                onTogglePlay={
                                                                    async () => {
                                                                        if (activeMusic && music.id === activeMusic.id) {
                                                                            setPlaying(
                                                                                state => !state
                                                                            )
                                                                        }
                                                                        else {
                                                                            const musicInfo = await getMusicInfo(music.id);
                                                                            if (musicInfo) {
                                                                                const playIndex = playlist.data.findIndex(
                                                                                    m => m.id === music.id
                                                                                )
                                                                                if (playIndex === -1) {
                                                                                    const nextPlay = {
                                                                                        ...music,
                                                                                        ...musicInfo
                                                                                    }
                                                                                    setActiveMusic(nextPlay)
                                                                                    setPlaylist(list => [nextPlay, ...list])
                                                                                }
                                                                                else {
                                                                                    setActiveMusic(playlist.data[playIndex])
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            />
                                                        </Tooltip>
                                                    )
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
                                                    const musicInfo = await getMusicInfo(music.id);
                                                    if (musicInfo) {
                                                        switch (cmd) {
                                                            case 'add':
                                                                const nextPlay = {
                                                                    ...music,
                                                                    ...musicInfo
                                                                }
                                                                setPlaylist(list => [...list, nextPlay])
                                                                if (playlist.data.length === 0) {
                                                                    setActiveMusic(nextPlay)
                                                                }
                                                                setToastMsg({
                                                                    type: 'success',
                                                                    msg: '已加入播放列表'
                                                                })
                                                                break;
                                                            case 'download':
                                                                downloadSong({
                                                                    ...music,
                                                                    url: musicInfo.url
                                                                })
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
                            <LoadingOverlay
                                open={urlParsing}
                                label="地址解析中.."
                                withBackground
                                withoutBackdrop
                                labelColor="#fff"
                            />
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
                                (end) => {
                                    if (!end) {
                                        setToastMsg({
                                            type: 'error',
                                            msg: `${activeMusic.name}播放错误`
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

async function parseMusic<T extends MusicInfo = MusicInfo>(id: number): Promise<T | null> {
    try {
        const { code, data } = await fetch(
            `/api/music/parse?id=${id}`
        ).then<ApiJsonType<T>>(
            response => response.json()
        );
        if (code === 0) {
            return data;
        }
        else {
            throw new Error('url parse error');
        }
    }
    catch (err) {
        return null;
    }
}
