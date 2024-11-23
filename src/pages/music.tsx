import React, { useState, useEffect, useMemo, useRef } from 'react'
import NoSsr from '@mui/material/NoSsr'
import Stack from '@mui/material/Stack'
import Snackbar from '@mui/material/Snackbar'
import Alert, { type AlertProps } from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import LinearProgress from '@mui/material/LinearProgress'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
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

export default function MusicSearch() {

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
    const songListWrapRef = useRef<HTMLDivElement | null>(null)

    const [downloading, setDownloading] = useState(false)

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setToastMsg(null)
    }

    const generateRandomIndex = (max: number, current: number) => {
        const random = Math.round(Math.random() * max);
        if (random === current) {
            return generateRandomIndex(max, current)
        }
        return random;
    }

    const onSearch = async (text: string) => {
        const s = text.trim()
        if (s.length === 0) {
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

    const downloadSong = async (music: SearchMusic) => {
        if (downloading) {
            setToastMsg({
                type: 'warning',
                msg: '已经有文件下载中..'
            })
            return;
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
        <NoSsr>
            <Box
                sx={{
                    height: '100%',
                    backgroundImage: 'var(--linear-gradient-image)'
                }}
            >
                <title>{pageTitle}</title>
                <Stack
                    sx={({ breakpoints }) => ({
                        position: 'relative',
                        width: '100%',
                        '--max-width': '600px',
                        height: '100%',
                        maxWidth: 'var(--max-width)',
                        margin: '0 auto',
                        overflow: 'hidden',
                        [breakpoints.up('sm')]: {
                            backgroundImage: activeMusic ? 'linear-gradient(0, #0000002e, transparent)' : 'none'
                        }
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
                                height: 24
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
                            sx={(theme) => ({
                                width: '100%',
                                [theme.breakpoints.up('sm')]: {
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
                                sx={(theme) => ({
                                    flexGrow: 1,
                                    px: 1.5,
                                    overflowY: 'auto',
                                    pb: activeMusic ? 12 : 2,
                                    [theme.breakpoints.up('sm')]: {
                                        pb: activeMusic ? 14 : 2
                                    }
                                })}
                                ref={songListWrapRef}
                            >
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
                                        color="text.secondary"
                                    >🔍 输入歌名/歌手名开始搜索</Typography>
                                </Stack>
                            )
                        )
                    }
                    {
                        activeMusic !== null && (
                            <Stack
                                sx={({ transitions, zIndex }) => ({
                                    position: 'fixed',
                                    width: '100%',
                                    maxWidth: 'var(--max-width)',
                                    bottom: 0,
                                    boxShadow: '0px -4px 12px 0px rgb(0 0 0 / 80%)',
                                    transition: transitions.create('transform'),
                                    transform: playlistShow ? 'none' : 'translate(0, 50vh)',
                                    zIndex: zIndex.drawer + 2
                                })}
                            >
                                <MusicPlayer
                                    music={activeMusic}
                                    playing={playing}
                                    onPlayStateChange={setPlaying}
                                    repeat={repeat.data}
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
                                                        () => setPlaylistShow(
                                                            show => !show
                                                        )
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
                                <DarkThemed>
                                    <Box
                                        sx={{
                                            height: '50vh',
                                            overflowY: 'auto',
                                            bgcolor: 'background.paper',
                                            color: '#fff',
                                            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
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
                </Stack>
                <LoadingOverlay
                    open={searchTask.pending}
                    label="搜索中.."
                    withBackground
                />
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