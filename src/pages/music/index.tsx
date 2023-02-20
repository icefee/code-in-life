import React, { useState, useEffect, useRef } from 'react';
import type { GetServerDataProps, HeadProps, PageProps } from 'gatsby';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DownloadIcon from '@mui/icons-material/Download';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeDownRoundedIcon from '@mui/icons-material/VolumeDownRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import SearchForm from '../../components/search/Form';
import { Api } from '../../util/config';
import { timeFormatter } from '../../util/date';
import { LoadingOverlay } from '../../components/loading';

interface SearchMusic {
    id: number;
    name: string;
    artist: string;
}

interface MusicSearchProps {
    s?: string;
    list: SearchMusic[];
}

interface PlayingMusic extends SearchMusic {
    url: string;
}

export default function MusicSearch({ serverData }: PageProps<object, object, unknown, MusicSearchProps>) {

    const { s = '', list } = serverData;
    const [keyword, setKeyword] = useState(s)
    const [error, setError] = useState(false)

    const [activeMusic, setActiveMusic] = useState<PlayingMusic>()
    const [playing, setPlaying] = useState(false)
    const musicUrlMap = useRef<Map<number, string>>(new Map())

    const [urlParsing, setUrlParsing] = useState(false)

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setError(false);
    }

    const getMusicUrl = async (id: SearchMusic['id']) => {
        const cachedMusicUrl = musicUrlMap.current.get(id);
        if (cachedMusicUrl) {
            return cachedMusicUrl;
        }
        setUrlParsing(true)
        const parsedUrl = await parseMusicUrl(id)
        if (parsedUrl) {
            musicUrlMap.current.set(id, parsedUrl);
        }
        setUrlParsing(false)
        return parsedUrl;
    }

    return (
        <Stack sx={{
            height: '100%',
            backgroundImage: 'var(--linear-gradient-image)'
        }} direction="column">
            <Stack sx={{
                position: 'relative',
                zIndex: 100,
                p: 2
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
                        action="/music"
                        value={keyword}
                        onChange={setKeyword}
                    />
                </Box>
            </Stack>
            {
                s === '' ? (
                    <Stack sx={{
                        position: 'relative',
                        zIndex: 120
                    }} flexGrow={1} justifyContent="center" alignItems="center">
                        <Typography variant="body1" color="hsl(270, 64%, 84%)">🔍 输入歌名/歌手名开始搜索</Typography>
                    </Stack>
                ) : (
                    <Box sx={{
                        position: 'relative',
                        flexGrow: 1,
                        overflow: 'hidden'
                    }}>
                        <Box sx={{
                            height: '100%',
                            px: 2,
                            overflowY: 'auto',
                            pb: activeMusic ? 13 : 0
                        }}>
                            <List sx={{
                                bgcolor: 'background.paper'
                            }}>
                                {
                                    list.map(
                                        (music, index) => (
                                            <React.Fragment key={music.id}>
                                                {
                                                    index > 0 && <Divider />
                                                }
                                                <MusicItem
                                                    music={music}
                                                    playing={activeMusic && activeMusic.id === music.id && playing}
                                                    onTogglePlay={
                                                        async (music) => {
                                                            if (activeMusic && music.id === activeMusic.id) {
                                                                setPlaying(
                                                                    state => !state
                                                                )
                                                            }
                                                            else {
                                                                const url = await getMusicUrl(music.id)
                                                                if (url) {
                                                                    setActiveMusic({
                                                                        ...music,
                                                                        url
                                                                    })
                                                                    setPlaying(true)
                                                                }
                                                                else {
                                                                    setError(true)
                                                                }
                                                            }
                                                        }
                                                    }
                                                    onDownload={
                                                        async (music) => {
                                                            const url = await getMusicUrl(music.id)
                                                            if (url) {
                                                                window.open(
                                                                    `/api/music/download?name=${encodeURIComponent(`${music.artist}-${music.name}`)}&id=${btoa(url)}`
                                                                )
                                                            }
                                                            else {
                                                                setError(true)
                                                            }
                                                        }
                                                    }
                                                />
                                            </React.Fragment>
                                        )
                                    )
                                }
                            </List>
                        </Box>
                        <Slide direction="up" in={Boolean(activeMusic)} mountOnEnter unmountOnExit>
                            <Box sx={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                boxShadow: '0px -4px 12px 0px rgb(0 0 0 / 80%)'
                            }}>
                                <MusicPlayer
                                    music={activeMusic}
                                    playing={playing}
                                    onPlayStateChange={setPlaying}
                                />
                            </Box>
                        </Slide>
                        <LoadingOverlay
                            open={urlParsing}
                            label="地址解析中.."
                            withBackground
                            labelColor="#fff"
                        />
                    </Box>
                )
            }
            <Snackbar open={error} autoHideDuration={5000} onClose={
                () => setError(false)
            } anchorOrigin={{
                horizontal: 'center',
                vertical: 'bottom'
            }}>
                <Alert severity="error" onClose={handleClose}>当前歌曲不可用</Alert>
            </Snackbar>
        </Stack>
    )
}

async function parseMusicUrl(id: number): Promise<string | null> {
    try {
        const { code, data } = await fetch(
            `/api/music/parse?id=${id}`
        ).then<{
            code: number;
            data: string;
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

interface PlayOrPauseButtonProps {
    playing: boolean;
    onTogglePlay(value: boolean): void;
}

function PlayOrPauseButton({ playing, onTogglePlay }: PlayOrPauseButtonProps) {
    return (
        <IconButton color="inherit" onClick={
            () => onTogglePlay(!playing)
        }>
            {
                playing ? <PauseIcon /> : <PlayArrowIcon />
            }
        </IconButton>
    )
}


interface MusicItemProps {
    music: SearchMusic;
    playing: boolean;
    onTogglePlay(music: SearchMusic): void;
    onDownload(music: SearchMusic): void;
}

function MusicItem({ music, playing, onDownload, onTogglePlay }: MusicItemProps) {

    // https://apis.jxcxin.cn/api/kuwo?id=228908&type=mp3

    return (
        <ListItem
            secondaryAction={
                <Stack direction="row" columnGap={.5}>
                    <PlayOrPauseButton
                        playing={playing}
                        onTogglePlay={
                            () => onTogglePlay(music)
                        }
                    />
                    <IconButton color="inherit" onClick={
                        () => onDownload(music)
                    }>
                        <DownloadIcon />
                    </IconButton>
                </Stack>
            }
        >
            <ListItemAvatar>
                <Avatar sx={{
                    bgcolor: '#561f8d'
                }}>
                    <MusicNoteIcon />
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={music.name}
                secondary={music.artist}
            />
        </ListItem>
    )
}


interface MusicPlayerProps {
    music: PlayingMusic;
    playing: boolean;
    onPlayStateChange(state: boolean): void;
}

function MusicPlayer({ music, playing, onPlayStateChange }: MusicPlayerProps) {

    const audioRef = useRef<HTMLAudioElement>()
    const [duration, setDuration] = useState<number>()
    const [currentTime, setCurrentTime] = useState<number>(0)
    const [volume, setVolume] = useState(1)
    const cachedVolumeRef = useRef<number>(1)

    useEffect(() => {
        return () => {
            setCurrentTime(0)
        }
    }, [music.id])

    useEffect(() => {
        if (playing) {
            audioRef.current.play()
        }
        else {
            audioRef.current.pause()
        }
    }, [playing])

    return (
        <Stack sx={{
            position: 'relative',
            p: 1,
            bgcolor: '#111',
            color: '#fff',
            columnGap: 2
        }} direction="row" alignItems="center">
            <Stack sx={(theme) => ({
                width: 50,
                aspectRatio: '1 / 1',
                color: '#fff',
                borderRadius: '50%',
                backgroundImage: 'var(--linear-gradient-image)',
                [theme.breakpoints.up('sm')]: {
                    width: 75
                }
            })} justifyContent="center" alignItems="center" flexShrink={0}>
                <MusicNoteIcon fontSize="large" />
            </Stack>
            <Stack flexGrow={1}>
                <Stack sx={{
                    columnGap: 1
                }} direction="row">
                    <Stack sx={{
                        columnGap: 1
                    }} flexDirection="row" alignItems="center" flexGrow={1}>
                        <Stack sx={(theme) => ({
                            maxWidth: 120,
                            [theme.breakpoints.up('sm')]: {
                                maxWidth: 300
                            }
                        })}>
                            <Typography variant="button" noWrap textOverflow="ellipsis">{music.name}</Typography>
                        </Stack>
                        <Stack>
                            <Typography variant="overline" color="#ffffffcc" noWrap>{music.artist}</Typography>
                        </Stack>
                    </Stack>
                    <Stack sx={{
                        color: '#fff'
                    }} direction="row" alignItems="center">
                        <PlayOrPauseButton
                            playing={playing}
                            onTogglePlay={
                                (nextState) => {
                                    onPlayStateChange(nextState)
                                }
                            }
                        />
                    </Stack>
                </Stack>
                <Stack direction="row" alignItems="center">
                    <Typography variant="button">{timeFormatter(currentTime)} / {duration ? timeFormatter(duration) : '--:--'}</Typography>
                    <Stack sx={{
                        ml: 2
                    }} flexGrow={1}>
                        <Slider
                            size="small"
                            value={duration ? (currentTime * 100 / duration) : 0}
                            onChange={
                                (_event, value: number) => {
                                    if (duration) {
                                        audioRef.current.currentTime = value * duration / 100;
                                    }
                                }
                            }
                        />
                    </Stack>
                </Stack>
                <Stack sx={{
                    display: {
                        xs: 'none',
                        sm: 'block'
                    }
                }} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack sx={(theme) => ({
                        width: 120,
                        [theme.breakpoints.up('sm')]: {
                            width: 150
                        }
                    })} direction="row" justifyContent="space-between" alignItems="center" flexShrink={0} columnGap={1}>
                        <IconButton
                            color="inherit"
                            onClick={
                                () => {
                                    if (volume > 0) {
                                        setVolume(0)
                                        audioRef.current.volume = 0;
                                    }
                                    else {
                                        const targetVolume = cachedVolumeRef.current > 0 ? cachedVolumeRef.current : .5;
                                        setVolume(targetVolume)
                                        audioRef.current.volume = targetVolume;
                                    }
                                }
                            }
                        >
                            {
                                volume > 0 ? volume > .5 ? <VolumeUpRoundedIcon /> : <VolumeDownRoundedIcon /> : <VolumeOffRoundedIcon />
                            }
                        </IconButton>
                        <Stack flexGrow={1} justifyContent="center">
                            <Slider
                                size="small"
                                value={volume * 100}
                                onChange={
                                    (_event, value: number) => {
                                        if (duration) {
                                            // setVolume(value / 100)
                                            const actualVolume = value / 100;
                                            audioRef.current.volume = actualVolume;
                                            cachedVolumeRef.current = actualVolume;
                                        }
                                    }
                                }
                            />
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
            <audio
                style={{
                    position: 'absolute',
                    zIndex: -100,
                    width: 0,
                    height: 0
                }}
                key={music.id}
                ref={audioRef}
                preload="auto"
                onLoadedMetadata={
                    () => {
                        setDuration(audioRef.current.duration)
                    }
                }
                onCanPlay={
                    () => {
                        audioRef.current.play()
                    }
                }
                onPlay={
                    () => {
                        onPlayStateChange(true)
                    }
                }
                onPause={
                    () => {
                        onPlayStateChange(false)
                    }
                }
                onTimeUpdate={
                    () => {
                        setCurrentTime(audioRef.current.currentTime)
                    }
                }
                onEnded={
                    () => {
                        onPlayStateChange(false)
                    }
                }
                onVolumeChange={
                    () => {
                        const volume = audioRef.current.volume;
                        setVolume(volume);
                    }
                }
                src={music.url}
            />
        </Stack>
    )
}

export function Head({ serverData }: HeadProps<object, object, MusicSearchProps>) {
    const { s } = serverData;
    let title = '音乐搜索';
    if (s) {
        title += ' - ' + s
    }
    return (
        <title>{title}</title>
    )
}

async function getMusicSearch(s: string): Promise<SearchMusic[]> {
    const url = `${Api.music}/s/${s}`;
    try {
        const html = await fetch(url).then(
            response => response.text()
        )
        const matchBlocks = html.replace(/[\n\s\r]+/g, '').match(
            /<tr><td><ahref="\/music\/\d+"class="text-primaryfont-weight-bold"target="_blank">[^<]+<\/a><\/td><tdclass="text-success">[^<]+<\/td><td><ahref="\/music\/\d+"target="_blank"><u>下载<\/u><\/a><\/td><\/tr>/g
        )
        if (matchBlocks) {
            return matchBlocks.map(
                (block) => {
                    const url = block.match(/music\/\d+/)[0]
                    const id = url.match(/\d+/)
                    const nameBlock = block.match(/(?<=<ahref="\/music\/\d+"class="text-primaryfont-weight-bold"target="_blank">)[^<]+(?=<\/a>)/)
                    const artistBlock = block.match(/(?<=<tdclass="text-success">)[^<]+(?=<\/td>)/)
                    return {
                        id: parseInt(id[0]),
                        name: nameBlock[0],
                        artist: artistBlock[0]
                    }
                }
            )
        }
        return [];
    }
    catch (err) {
        return null;
    }
}

export async function getServerData({ query }: GetServerDataProps) {
    const { s = '' } = query as Record<'s', string>;
    if (s === '') {
        return {
            props: {
                list: []
            }
        }
    }
    try {
        const list = await getMusicSearch(s)
        if (list) {
            return {
                props: {
                    list,
                    s: decodeURIComponent(s)
                }
            }
        }
        else {
            throw new Error('Get search error')
        }
    }
    catch (err) {
        return {
            status: 404
        }
    }
}