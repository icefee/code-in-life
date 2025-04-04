import React, { useState, useEffect, useMemo, useRef } from 'react'
import type { PageProps } from 'gatsby'
import NoSsr from '@mui/material/NoSsr'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Snackbar from '@mui/material/Snackbar'
import Alert, { type AlertProps } from '@mui/material/Alert'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import LinearProgress from '@mui/material/LinearProgress'
import Collapse from '@mui/material/Collapse'
import Fade from '@mui/material/Fade'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import PlaylistPlayRoundedIcon from '@mui/icons-material/PlaylistPlayRounded'
import HeadLayout from '~/components/layout/Head'
import SearchForm, { type SearchFormInstance } from '~/components/search/Form'
import { LoadingOverlay } from '~/components/loading'
import MusicPlayer, { RepeatMode } from '~/components/player/MusicPlayer'
import { DarkThemed } from '~/components/theme'
import NoData from '~/components/search/NoData'
import SongList from '~/components/search/SongList'
import MusicPlayList from '~/components/player/MusicPlayList'
import useLocalStorageState from '~/components/hook/useLocalStorageState'
import { getParamsUrl, loadFileChunks, getJson } from '~/util/proxy'
import { maxChunkSize } from '~/util/config'
import { blobToFile } from '~/util/blobToFile'

export function Head() {
    return (
        <HeadLayout />
    )
}

export default function MusicSearch({ location }: PageProps) {

    const proxy = /^\?proxy/.test(location.search)
    const [keyword, setKeyword] = useState('')
    const [toastMsg, setToastMsg] = useState<ToastMsg<AlertProps['severity']> | null>(null)
    const [searchTask, setSearchTask] = useState<SearchTask<SearchMusic>>({
        data: [],
        pending: false,
        complete: false,
        success: false
    })
    const searchFormRef = useRef<SearchFormInstance>()

    const [activeMusic, setActiveMusic] = useState<SearchMusic | null>(null)
    const [playing, setPlaying] = useState(false)

    const [playlistShow, setPlaylistShow] = useState(false)
    const [repeat, setRepeat] = useLocalStorageState<RepeatMode>('__repeat_mode', RepeatMode.All)

    const [playlist, setPlaylist] = useLocalStorageState<SearchMusic[]>('__playlist', [])
    const listScroller = useRef<HTMLDivElement | null>(null)

    const [downloading, setDownloading] = useState(false)

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return
        }
        setToastMsg(null)
    }

    const generateRandomIndex = (max: number, current: number) => {
        const random = Math.round(Math.random() * max)
        if (random === current) {
            return generateRandomIndex(max, current)
        }
        return random
    }

    const getPlayingIndex = (active: SearchMusic = activeMusic) => {
        const { data } = playlist
        const index = active ? data.findIndex(
            music => music.id === active.id
        ) : -1
        return {
            index,
            data
        }
    }

    const onSearch = async (text: string) => {
        const s = text.trim()
        if (s.length === 0) {
            setToastMsg({
                type: 'warning',
                msg: '关键词不能为空'
            })
            return
        }
        setSearchTask(t => ({
            ...t,
            complete: false,
            pending: true
        }))
        let success = false
        let data = null
        const list = await getSearch(s)
        if (list) {
            data = list
            success = true
        }
        else {
            success = false
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
        const { init, data } = playlist
        if (init) {
            if (data.length > 0) {
                setActiveMusic(data[0])
                setTimeout(() => {
                    setPlaylistShow(true)
                }, 400)
            }
            else {
                setPlaylistShow(false)
            }
        }
        if (data.length > 1) {
            navigator.mediaSession.setActionHandler('previoustrack', playPrevious)
            navigator.mediaSession.setActionHandler('nexttrack', playNext)
        }
        return () => {
            if (data.length > 1) {
                navigator.mediaSession.setActionHandler('previoustrack', null)
                navigator.mediaSession.setActionHandler('nexttrack', null)
            }
        }
    }, [playlist])

    useEffect(() => {
        const { data } = playlist
        if (data.length > 1) {
            navigator.mediaSession.setActionHandler('previoustrack', playPrevious)
            navigator.mediaSession.setActionHandler('nexttrack', playNext)
        }
        return () => {
            if (data.length > 1) {
                navigator.mediaSession.setActionHandler('previoustrack', null)
                navigator.mediaSession.setActionHandler('nexttrack', null)
            }
        }
    }, [playlist, activeMusic])

    useEffect(() => {
        if (searchTask.success && searchTask.data.length > 0) {
            listScroller.current.scrollTo({
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

    const downloadSong = async (music: SearchMusic) => {
        if (downloading) {
            setToastMsg({
                type: 'warning',
                msg: '已经有文件下载中..'
            })
            return
        }
        try {
            setDownloading(true)
            const url = `/api/music/download/${music.id}`
            const buffer = await loadFileChunks(url, {
                chunkSize: maxChunkSize
            })
            const { name } = generateSearchQuery(music)
            const blob = new Blob([buffer], { type: 'audio/mpeg' })
            blobToFile(blob, `${name}.mp3`)
        }
        catch (err) {
            setToastMsg({
                type: 'error',
                msg: '文件下载失败: ' + err
            })
        }
        finally {
            setDownloading(false)
        }
    }

    const downloadLrc = (music: SearchMusic) => {
        open(
            getParamsUrl(
                `/api/music/lrc/download/${music.id}`,
                generateSearchQuery(music)
            )
        )
    }

    const pageTitle = useMemo(() => {
        if (activeMusic) {
            return `🎵 ${activeMusic.name} - ${activeMusic.artist} ${playing ? '⏸' : '▶'}`
        }
        return '音乐搜索'
    }, [activeMusic, playing])

    const playPrevious = () => {
        const { index, data } = getPlayingIndex()
        if (index > 0) {
            setActiveMusic(data[index - 1])
        }
        else {
            setActiveMusic(data[data.length - 1])
        }
    }

    const playNext = () => {
        const { index, data } = getPlayingIndex()
        if (index < data.length - 1) {
            setActiveMusic(data[index + 1])
        }
        else {
            setActiveMusic(data[0])
        }
    }

    useEffect(() => {
        if (activeMusic) {
            const { name, artist, poster } = activeMusic
            navigator.mediaSession.metadata = new MediaMetadata({
                title: name,
                artist: artist,
                artwork: [
                    {
                        src: poster,
                        sizes: '256x256',
                        type: 'image/jpeg'
                    }
                ]
            })
        }
    }, [activeMusic])

    return (
        <NoSsr>
            <title>{pageTitle}</title>
            <Box
                className="image-container"
                sx={{
                    overflow: 'hidden',
                    '--max-width': '600px'
                }}
            >
                <Stack
                    sx={({ palette }) => ({
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        maxWidth: 'var(--max-width)',
                        bgcolor: activeMusic ? alpha(palette.background.default, .4) : 'none',
                        backdropFilter: 'blur(4px)',
                        margin: '0 auto'
                    })}
                >
                    <Collapse
                        sx={{
                            flexShrink: 0
                        }}
                        in={downloading}
                        unmountOnExit
                    >
                        <Stack
                            sx={{
                                position: 'relative',
                                height: 24,
                                zIndex: 6
                            }}
                        >
                            <LinearProgress
                                color="secondary"
                                sx={{
                                    height: '100%'
                                }}
                            />
                            <Typography
                                variant="button"
                                sx={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >歌曲下载中, 请稍候..</Typography>
                        </Stack>
                    </Collapse>
                    <Stack
                        sx={{
                            position: 'relative',
                            width: '100%',
                            p: 1.5,
                            zIndex: 3
                        }}
                        direction="row"
                        justifyContent="center"
                    >
                        <Box
                            sx={({ breakpoints }) => ({
                                width: '100%',
                                [breakpoints.up('sm')]: {
                                    maxWidth: 320
                                }
                            })}
                        >
                            <SearchForm
                                ref={searchFormRef}
                                value={keyword}
                                onChange={setKeyword}
                                onSubmit={onSearch}
                                loading={searchTask.pending}
                                buttonColor="secondary"
                                autocompleteKey="music"
                                placeholder="输入歌名/歌手名搜索.."
                            />
                        </Box>
                    </Stack>
                    {
                        searchTask.success ? searchTask.data.length > 0 ? (
                            <Box
                                sx={({ breakpoints }) => ({
                                    flexGrow: 1,
                                    px: 1.5,
                                    overflowY: 'auto',
                                    pb: activeMusic ? 12 : 2,
                                    [breakpoints.up('sm')]: {
                                        pb: activeMusic ? 14 : 2
                                    }
                                })}
                                ref={listScroller}
                            >
                                <SongList
                                    data={searchTask.data}
                                    isCurrentPlaying={(music: SearchMusic) => ({
                                        isCurrent: activeMusic && activeMusic.id === music.id,
                                        playing
                                    })}
                                    onTogglePlay={
                                        async (music) => {
                                            if (activeMusic && music.id === activeMusic.id) {
                                                setPlaying(!playing)
                                            }
                                            else {
                                                const { index } = getPlayingIndex(music)
                                                if (index === -1) {
                                                    setActiveMusic(music)
                                                    setPlaylist(list => [music, ...list])
                                                }
                                                else {
                                                    setActiveMusic(playlist.data[index])
                                                }
                                            }
                                        }
                                    }
                                    onAction={
                                        async (cmd, music) => {
                                            const { index } = getPlayingIndex(music)
                                            if (index !== -1 && cmd === 'add') {
                                                setToastMsg({
                                                    type: 'warning',
                                                    msg: '当前歌曲已经在播放列表中'
                                                })
                                                return
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
                                                    break
                                                case 'download-song':
                                                    downloadSong(music)
                                                    break
                                                case 'download-lrc':
                                                    downloadLrc(music)
                                                    break
                                                default:
                                                    break
                                            }
                                        }
                                    }
                                />
                            </Box>
                        ) : (
                            <NoData text='💔 没有找到相关的音乐, 换个关键词试试吧' />
                        ) : (
                            !searchTask.pending && (
                                <Stack
                                    sx={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                    }}
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: '#fff',
                                            textShadow: '#000 1px 1px 2px'
                                        }}
                                    >🔍 输入歌名/歌手名开始搜索</Typography>
                                </Stack>
                            )
                        )
                    }
                    <Fade in={playlistShow} unmountOnExit>
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                zIndex: 4,
                                bgcolor: '#0008'
                            }}
                            onClick={
                                () => setPlaylistShow(false)
                            }
                        />
                    </Fade>
                    <LoadingOverlay
                        open={searchTask.pending}
                        label="搜索中.."
                        fixed={false}
                        withBackground
                    />
                </Stack>
                {
                    activeMusic !== null && (
                        <Stack
                            sx={({ transitions, zIndex }) => ({
                                position: 'fixed',
                                width: '100%',
                                maxWidth: 'var(--max-width)',
                                boxShadow: '0px -4px 12px 0px rgb(0 0 0 / 80%)',
                                transition: transitions.create('transform', {
                                    duration: '.4s'
                                }),
                                bottom: 0,
                                left: '50%',
                                transform: `translate(-50%, ${playlistShow ? 0 : '60vh'})`,
                                zIndex: zIndex.drawer + 2
                            })}
                        >
                            <MusicPlayer
                                music={activeMusic}
                                playing={playing}
                                onPlayStateChange={setPlaying}
                                repeat={repeat.data}
                                proxy={proxy}
                                extendButtons={
                                    <Tooltip title="播放列表">
                                        <Badge
                                            sx={{
                                                '& .MuiBadge-badge': {
                                                    top: 4,
                                                    right: 4
                                                }
                                            }}
                                            color="secondary"
                                            badgeContent={playlist.data.length}
                                        >
                                            <IconButton
                                                color="inherit"
                                                size="small"
                                                onClick={
                                                    () => {
                                                        setPlaylistShow(!playlistShow)
                                                    }
                                                }
                                            >
                                                <PlaylistPlayRoundedIcon />
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
                                            switch (repeat.data) {
                                                case RepeatMode.Random:
                                                    const { index, data } = getPlayingIndex()
                                                    const nextPlayIndex = generateRandomIndex(data.length - 1, index)
                                                    setActiveMusic(playlist.data[nextPlayIndex])
                                                    break
                                                case RepeatMode.All:
                                                    playNext()
                                            }
                                        }
                                        else {
                                            setPlaying(true)
                                        }
                                    }
                                }
                            />
                            <DarkThemed>
                                <Box
                                    sx={{
                                        height: '60vh',
                                        overflowY: 'auto',
                                        bgcolor: 'background.paper',
                                        color: '#fff',
                                        borderTop: ({ palette }) => `1px solid ${palette.divider}`,
                                        '&::-webkit-scrollbar-thumb': {
                                            bgcolor: 'var(--scrollbar-thumb-dark-mode-color)'
                                        },
                                        '&::-webkit-scrollbar-thumb:hover': {
                                            bgcolor: 'var(--scrollbar-thumb-dark-mode-hover-color)'
                                        }
                                    }}
                                >
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
                                </Box>
                            </DarkThemed>
                        </Stack>
                    )
                }
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
                            <Alert
                                severity={toastMsg.type}
                                onClose={handleClose}
                            >{toastMsg.msg}</Alert>
                        )
                    }
                </Snackbar>
            </Box>
        </NoSsr>
    )
}

async function getSearch(s: string): Promise<SearchMusic[] | null> {
    try {
        const searchParams = new URLSearchParams({
            s
        })
        const { code, data } = await getJson<ApiJsonType<SearchMusic[]>>(
            `/api/music/list?${searchParams}`
        )
        if (code === 0) {
            return data
        }
        else {
            throw new Error('search failed')
        }
    }
    catch (err) {
        return null
    }
}