import React, { useState, useEffect, useRef, useMemo } from 'react';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PublishIcon from '@mui/icons-material/Publish';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useLocalStorage } from 'react-use';
import SearchForm from '../../components/search/Form';
import { LoadingOverlay } from '../../components/loading';
import MusicPlayer, { type SearchMusic, type MusicInfo, type PlayingMusic, RepeatMode } from '../../components/player/MusicPlayer';
import MusicPoster from '../../components/player/MusicPoster';
import PlayOrPauseButton from '../../components/player/PlayOrPauseButton';
import { DarkThemed } from '../../components/theme';
import NoData from '../../components/search/NoData';
import MusicPlayIcon from '../../components/loading/music';

export default function MusicSearch() {

    const [keyword, setKeyword] = useState('')
    const [error, setError] = useState<Error>(null)
    const [songList, setSongList] = useState<SearchMusic[]>([])
    const [searching, setSearching] = useState(false)
    const [searchComplete, setSearchComplete] = useState(false)

    const [activeMusic, setActiveMusic] = useState<PlayingMusic>()
    const [playing, setPlaying] = useState(false)
    const musicUrlMap = useRef<Map<number, MusicInfo>>(new Map())

    const [urlParsing, setUrlParsing] = useState(false)
    const [playlistShow, setPlaylistShow] = useState(false)
    const [repeat, setRepeat] = useState<RepeatMode>(RepeatMode.All)

    const [playlist, setPlaylist] = useState<PlayingMusic[]>([])
    const [storage, setStorage] = useLocalStorage<PlayingMusic[]>('__playlist', [])

    const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement>(null)
    const editingMusic = useRef<PlayingMusic>()

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setError(null);
    }

    const getMusicUrl = async (id: SearchMusic['id']) => {
        const cachedMusicUrl = musicUrlMap.current.get(id);
        if (cachedMusicUrl) {
            return cachedMusicUrl;
        }
        setUrlParsing(true)
        const musicInfo = await parseMusic(id)
        if (musicInfo) {
            musicUrlMap.current.set(id, musicInfo);
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
        setSearching(true)
        const list = await getSearch(s)
        if (list) {
            setSongList(list)
        }
        else {
            setError(
                new Error('获取歌曲列表失败')
            )
        }
        setSearching(false)
        setSearchComplete(true)
    }

    const playIndex = useMemo(
        () => {
            if (!activeMusic || playlist.length === 0) {
                return null;
            }
            return playlist.findIndex(
                music => music.id === activeMusic.id
            )
        },
        [activeMusic, playlist]
    )

    useEffect(() => {
        const storageList = storage || [];
        setPlaylist(storageList)
        if (storageList.length > 0) {
            setActiveMusic(storageList[0])
        }
    }, [])

    useEffect(() => {
        setStorage(playlist)
    }, [playlist])

    const pinToTop = () => {
        const music = editingMusic.current;
        setPlaylist(
            list => list.sort(
                (prev) => prev.id === music.id ? -1 : 0
            )
        )
        setMenuAnchorEl(null)
    }

    const removeSong = () => {
        const music = editingMusic.current;
        if (music.id === activeMusic.id) {
            if (playlist.length > 1) {
                setActiveMusic(
                    playlist[playIndex > 0 ? playIndex - 1 : playIndex + 1]
                )
            }
            else {
                setActiveMusic(null)
                setPlaying(false)
            }
        }
        setPlaylist(
            list => list.filter(
                item => item.id !== activeMusic.id
            )
        )
        setMenuAnchorEl(null)
    }

    return (
        <Stack sx={{
            height: '100%',
            backgroundImage: 'var(--linear-gradient-image)'
        }} direction="column">
            <Stack sx={{
                position: 'absolute',
                width: '100%',
                zIndex: 150,
                p: 1
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
                        onSubmit={onSearch}
                    />
                </Box>
            </Stack>
            {
                searchComplete ? (
                    <Box sx={{
                        position: 'relative',
                        flexGrow: 1,
                        overflow: 'hidden',
                        pt: 8,
                        width: '100%',
                        maxWidth: 600,
                        margin: '0 auto'
                    }}>
                        {
                            songList.length > 0 ? (
                                <Box sx={(theme) => ({
                                    height: '100%',
                                    pt: 1,
                                    px: 1,
                                    overflowY: 'auto',
                                    pb: activeMusic ? 13 : 2,
                                    [theme.breakpoints.up('sm')]: {
                                        pb: activeMusic ? 16 : 2
                                    }
                                })}>
                                    <List sx={{
                                        bgcolor: 'background.paper'
                                    }}>
                                        {
                                            songList.map(
                                                (music, index) => (
                                                    <ListItem
                                                        secondaryAction={
                                                            <Tooltip title="下载歌曲">
                                                                <IconButton color="inherit" onClick={
                                                                    async () => {
                                                                        const musicInfo = await getMusicUrl(music.id)
                                                                        if (musicInfo) {
                                                                            window.open(
                                                                                `/api/music?name=${encodeURIComponent(`${music.artist}-${music.name}`)}&id=${btoa(musicInfo.url)}`
                                                                            )
                                                                        }
                                                                        else {
                                                                            setError(
                                                                                new Error('解析歌曲失败, 可能是网络连接问题')
                                                                            )
                                                                        }
                                                                    }
                                                                }>
                                                                    <DownloadIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        }
                                                        divider={index < songList.length - 1}
                                                        key={music.id}
                                                    >
                                                        <ListItemAvatar>
                                                            <Tooltip title="试听歌曲">
                                                                <Avatar sx={{
                                                                    backgroundImage: 'var(--linear-gradient-image)'
                                                                }}>
                                                                    <PlayOrPauseButton
                                                                        playing={activeMusic && activeMusic.id === music.id && playing}
                                                                        onTogglePlay={
                                                                            async () => {
                                                                                if (activeMusic && music.id === activeMusic.id) {
                                                                                    setPlaying(
                                                                                        state => !state
                                                                                    )
                                                                                }
                                                                                else {
                                                                                    const musicInfo = await getMusicUrl(music.id)
                                                                                    if (musicInfo) {
                                                                                        const nextPlay = {
                                                                                            ...music,
                                                                                            ...musicInfo,
                                                                                            url: `/api/music?id=${btoa(musicInfo.url)}`
                                                                                        }
                                                                                        setActiveMusic(nextPlay)
                                                                                        const playIndex = playlist.findIndex(
                                                                                            music => music.id === nextPlay.id
                                                                                        )
                                                                                        if (playIndex !== -1) {
                                                                                            setActiveMusic(playlist[playIndex])
                                                                                        }
                                                                                        else {
                                                                                            setPlaylist(list => [nextPlay, ...list])
                                                                                        }
                                                                                        setPlaying(true)
                                                                                    }
                                                                                    else {
                                                                                        setError(
                                                                                            new Error('解析歌曲失败, 可能是网络连接问题')
                                                                                        )
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    />
                                                                </Avatar>
                                                            </Tooltip>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={music.name}
                                                            primaryTypographyProps={{
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis'
                                                            }}
                                                            secondary={music.artist}
                                                        />
                                                    </ListItem>
                                                )
                                            )
                                        }
                                    </List>
                                </Box>
                            ) : (
                                <NoData text='💔 没有找到相关的音乐, 换个关键词试试吧' />
                            )
                        }
                        <LoadingOverlay
                            open={urlParsing}
                            label="地址解析中.."
                            withBackground
                            labelColor="#fff"
                        />
                    </Box>
                ) : (
                    <Stack sx={{
                        position: 'relative',
                        zIndex: 120
                    }} flexGrow={1} justifyContent="center" alignItems="center">
                        <Typography variant="body1" color="hsl(270, 100%, 100%)">🔍 输入歌名/歌手名开始搜索</Typography>
                    </Stack>
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
                    zIndex: 200
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
                        repeat={repeat}
                        onRepeatChange={setRepeat}
                        onPlayEnd={
                            () => {
                                switch (repeat) {
                                    case RepeatMode.Random:
                                        if (playlist.length > 1) {
                                            const nextPlayIndex = generateRandomIndex(playlist.length - 1, playIndex)
                                            setActiveMusic(playlist[nextPlayIndex])
                                        }
                                        break;
                                    case RepeatMode.All:
                                        if (playIndex < playlist.length - 1) {
                                            setActiveMusic(playlist[playIndex + 1])
                                        }
                                        else {
                                            setActiveMusic(playlist[0])
                                        }
                                }
                            }
                        }
                    />
                    {
                        playlistShow && (
                            <DarkThemed>
                                <Box sx={{
                                    flexGrow: 1,
                                    bgcolor: 'background.paper',
                                    color: '#fff',
                                    overflowY: 'auto',
                                    borderTop: '1px solid #333'
                                }}>
                                    <List subheader={
                                        <ListSubheader component="li">播放列表</ListSubheader>
                                    } disablePadding dense>
                                        {
                                            playlist.map(
                                                (music, index) => {
                                                    const isCurrentPlaying = music.id === activeMusic.id;
                                                    return (
                                                        <ListItem
                                                            key={music.id}
                                                            divider={index < playlist.length - 1}
                                                            disablePadding
                                                            secondaryAction={
                                                                <>
                                                                    <IconButton onClick={
                                                                        (event: React.MouseEvent<HTMLButtonElement>) => {
                                                                            editingMusic.current = music;
                                                                            setMenuAnchorEl(event.currentTarget);
                                                                        }
                                                                    }>
                                                                        <MoreVertIcon />
                                                                    </IconButton>
                                                                    <Menu
                                                                        anchorEl={menuAnchorEl}
                                                                        open={Boolean(menuAnchorEl)}
                                                                        anchorOrigin={{
                                                                            vertical: 'top',
                                                                            horizontal: 'left',
                                                                        }}
                                                                        transformOrigin={{
                                                                            vertical: 'top',
                                                                            horizontal: 'right',
                                                                        }}
                                                                        onClose={
                                                                            () => setMenuAnchorEl(null)
                                                                        }
                                                                    >
                                                                        <MenuItem onClick={pinToTop}>
                                                                            <ListItemIcon>
                                                                                <PublishIcon />
                                                                            </ListItemIcon>
                                                                            <ListItemText>置顶</ListItemText>
                                                                        </MenuItem>
                                                                        <MenuItem onClick={removeSong}>
                                                                            <ListItemIcon>
                                                                                <DeleteOutlineIcon />
                                                                            </ListItemIcon>
                                                                            <ListItemText>移除</ListItemText>
                                                                        </MenuItem>
                                                                    </Menu>
                                                                </>
                                                            }
                                                        >
                                                            <ListItemButton
                                                                onClick={
                                                                    () => {
                                                                        if (!isCurrentPlaying) {
                                                                            setActiveMusic(music)
                                                                        }
                                                                    }
                                                                }
                                                            >
                                                                <Box sx={{
                                                                    position: 'relative',
                                                                    width: 45,
                                                                    height: 45,
                                                                    mr: 2
                                                                }}>
                                                                    <MusicPoster
                                                                        src={music.poster}
                                                                        placeholder={
                                                                            !music.poster && !isCurrentPlaying && <MusicNoteIcon />
                                                                        }
                                                                    />
                                                                    {
                                                                        isCurrentPlaying && (
                                                                            <Box sx={{
                                                                                position: 'absolute',
                                                                                left: '50%',
                                                                                top: '50%',
                                                                                transform: 'translate(-50%, -50%)'
                                                                            }}>
                                                                                <MusicPlayIcon
                                                                                    sx={{
                                                                                        display: 'block',
                                                                                        fontSize: 18
                                                                                    }}
                                                                                />
                                                                            </Box>
                                                                        )
                                                                    }
                                                                </Box>
                                                                <ListItemText
                                                                    primary={music.name}
                                                                    secondary={music.artist}
                                                                />
                                                            </ListItemButton>
                                                        </ListItem>
                                                    )
                                                }
                                            )
                                        }
                                    </List>
                                </Box>
                            </DarkThemed>
                        )
                    }
                </Stack>
            </Slide>
            <LoadingOverlay
                open={searching}
                label="搜索中.."
                withBackground
                labelColor="#fff"
            />
            <Snackbar
                open={Boolean(error)}
                autoHideDuration={5000}
                onClose={
                    () => setError(null)
                } anchorOrigin={{
                    horizontal: 'center',
                    vertical: 'bottom'
                }}>
                <Alert severity="error" onClose={handleClose}>当前歌曲不可用</Alert>
            </Snackbar>
        </Stack>
    )
}

async function getSearch(s: string): Promise<SearchMusic[] | null> {
    try {
        const { code, data } = await fetch(
            `/api/music/list?s=${encodeURIComponent(s)}`
        ).then<{
            code: number;
            data: SearchMusic[];
        }>(
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
        ).then<{
            code: number;
            data: T;
        }>(
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

export function Head() {
    return (
        <title>音乐搜索</title>
    )
}
