import React, { useState, useEffect, useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import RepeatOneIcon from '@mui/icons-material/RepeatOne';
import LoopIcon from '@mui/icons-material/Loop';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import MusicPoster from './MusicPoster';
import MusicLrc, { type Lrc } from './MusicLrc';
import PlayOrPauseButton from './PlayOrPauseButton';
import { timeFormatter } from '../../util/date';
import useLocalStorageState from '../hook/useLocalStorageState';
import { generate } from '../../util/url';

export interface SearchMusic {
    id: number;
    name: string;
    artist: string;
}

export interface MusicInfo {
    url: string;
    poster: string;
    lrc?: Lrc[];
}

export enum RepeatMode {
    All,
    One,
    Random
}

export interface PlayingMusic extends SearchMusic, MusicInfo { }

interface MusicPlayerProps {
    music?: PlayingMusic;
    playing: boolean;
    repeat: RepeatMode;
    onRepeatChange(mode: RepeatMode): void;
    onPlayStateChange(state: boolean): void;
    onTogglePlayList?: VoidFunction;
    onPlayEnd?(end: boolean): void;
}

function MusicPlayer({ music, playing, repeat, onPlayStateChange, onTogglePlayList, onRepeatChange, onPlayEnd }: MusicPlayerProps) {

    const audioRef = useRef<HTMLVideoElement>()
    const [duration, setDuration] = useState<number>()
    const [currentTime, setCurrentTime] = useState<number>(0)
    const [volume, setVolume] = useLocalStorageState<number>('__volume', 1)
    const cachedVolumeRef = useRef<number>(1)
    const [loading, setLoading] = useState(false)
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)
    const hasError = useRef(false)
    const seekingRef = useRef(false)
    const [buffered, setBuffered] = useState(0)

    useEffect(() => {
        return () => {
            setCurrentTime(0)
            audioRef.current.currentTime = 0
            seekingRef.current = false
            hasError.current = false
        }
    }, [music?.url])

    const togglePlay = async (play: boolean) => {
        try {
            if (play) {
                await audioRef.current?.play()
            }
            else {
                audioRef.current?.pause()
            }
        }
        catch (err) {
            if (hasError.current) {
                onPlayEnd?.(false)
                onPlayStateChange(false)
            }
        }
    }

    useEffect(() => {
        togglePlay(playing)
    }, [playing])

    const volumeIcon = useMemo(() => volume.data > 0 ? volume.data > .5 ? <VolumeUpIcon /> : <VolumeDownIcon /> : <VolumeOffIcon />, [volume])

    const repeatMeta = useMemo(() => {
        return repeat === RepeatMode.All ? {
            label: '列表循环',
            icon: <LoopIcon />
        } : repeat === RepeatMode.One ? {
            label: '单曲循环',
            icon: <RepeatOneIcon />
        } : {
            label: '随机播放',
            icon: <ShuffleIcon />
        }
    }, [repeat])

    useEffect(() => {
        if (volume.init) {
            audioRef.current.volume = volume.data;
        }
    }, [volume])

    const tryToAutoPlay = async () => {
        try {
            await audioRef.current.play()
            onPlayStateChange(true)
        }
        catch (err) {
            onPlayStateChange(false)
            console.warn('auto play failed because of browser security policy.')
        }
    }

    const reloadSong = () => {
        audioRef.current.src = generate(music.url);
        audioRef.current.load();
    }

    return (
        <Stack sx={{
            position: 'relative',
            p: 1,
            bgcolor: '#111',
            color: '#fff',
            columnGap: 2
        }} direction="row" alignItems="center">
            <Stack sx={(theme) => ({
                position: 'relative',
                width: 60,
                aspectRatio: '1 / 1',
                color: '#fff',
                borderRadius: '50%',
                [theme.breakpoints.up('sm')]: {
                    width: 75
                }
            })} justifyContent="center" alignItems="center" flexShrink={0}>
                <MusicPoster
                    alt={music ? `${music.name}-${music.artist}` : null}
                    src={music?.poster}
                    spinning={playing && !loading}
                />
                <Box sx={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: .8,
                    zIndex: 20
                }}>
                    {
                        loading ? (
                            <CircularProgress sx={{
                                display: 'block'
                            }} color="inherit" />
                        ) : (
                            <PlayOrPauseButton
                                playing={playing}
                                onTogglePlay={
                                    (nextState) => {
                                        onPlayStateChange(nextState)
                                    }
                                }
                                size="large"
                            />
                        )
                    }
                </Box>
            </Stack>
            <Stack flexGrow={1}>
                <Stack sx={{
                    position: 'relative'
                }} flexDirection="row" alignItems="center" rowGap={1} columnGap={1}>
                    <Stack sx={(theme) => ({
                        maxWidth: 150,
                        [theme.breakpoints.up('sm')]: {
                            maxWidth: 300
                        }
                    })}>
                        <Typography variant="body2" noWrap textOverflow="ellipsis">{music?.name}</Typography>
                    </Stack>
                    <Stack>
                        <Typography variant="caption" color="#ffffffcc" noWrap>{music?.artist}</Typography>
                    </Stack>
                    {
                        music?.lrc && (
                            <Box sx={{
                                position: 'absolute',
                                right: 0,
                                top: '50%',
                                transform: 'translate(0, -50%)',
                                pr: 1
                            }}>
                                <MusicLrc lrc={music.lrc} currentTime={currentTime} />
                            </Box>
                        )
                    }
                </Stack>
                <Stack direction="row" alignItems="center">
                    <Typography variant="button">{timeFormatter(currentTime)} / {duration ? timeFormatter(duration) : '--:--'}</Typography>
                    <Stack sx={{
                        mx: 2
                    }} flexGrow={1}>
                        <Slider
                            size="small"
                            value={duration ? (currentTime * 100 / duration) : 0}
                            sx={{
                                '& .MuiSlider-rail': {
                                    opacity: 1,
                                    bgcolor: 'currentcolor',
                                    backgroundImage: 'linear-gradient(0, #000, #000)'
                                },
                                '& .MuiSlider-rail::before': {
                                    content: '""',
                                    position: 'absolute',
                                    height: 'inherit',
                                    width: '100%',
                                    bgcolor: 'inherit',
                                    top: 'inherit',
                                    transform: 'inherit',
                                    opacity: .38
                                },
                                '& .MuiSlider-rail::after': {
                                    content: '""',
                                    position: 'absolute',
                                    height: 'inherit',
                                    width: buffered * 100 + '%',
                                    transition: (theme) => theme.transitions.create('width'),
                                    bgcolor: 'inherit',
                                    top: 'inherit',
                                    transform: 'inherit',
                                    opacity: .5
                                }
                            }}
                            onChange={
                                (_event, value: number) => {
                                    if (duration) {
                                        seekingRef.current = true;
                                        setCurrentTime(value * duration / 100)
                                    }
                                }
                            }
                            onChangeCommitted={
                                (_event, value: number) => {
                                    if (duration) {
                                        audioRef.current.currentTime = value * duration / 100;
                                    }
                                }
                            }
                        />
                    </Stack>
                    {
                        !isMobile && (
                            <>
                                <Tooltip title="音量">
                                    <IconButton
                                        color="inherit"
                                        size="small"
                                        onClick={
                                            (event: React.MouseEvent<HTMLButtonElement>) => {
                                                setAnchorEl(event.currentTarget);
                                            }
                                        }
                                    >
                                        {volumeIcon}
                                    </IconButton>
                                </Tooltip>
                                <Popover
                                    open={Boolean(anchorEl)}
                                    anchorEl={anchorEl}
                                    onClose={
                                        () => setAnchorEl(null)
                                    }
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'center',
                                    }}
                                    transformOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'center',
                                    }}
                                >
                                    <Stack sx={{
                                        height: 120,
                                        pt: 2
                                    }} alignItems="center">
                                        <Slider
                                            size="small"
                                            value={volume.data * 100}
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
                                            orientation="vertical"
                                        />
                                        <IconButton
                                            color="inherit"
                                            size="small"
                                            onClick={
                                                () => {
                                                    if (volume.data > 0) {
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
                                            {volumeIcon}
                                        </IconButton>
                                    </Stack>
                                </Popover>
                            </>
                        )
                    }
                    <Tooltip title="播放列表">
                        <IconButton
                            color="inherit"
                            onClick={onTogglePlayList}
                        >
                            <PlaylistPlayIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={repeatMeta.label}>
                        <IconButton
                            color="inherit"
                            size="small"
                            onClick={
                                () => {
                                    if (repeat === RepeatMode.All) {
                                        onRepeatChange(RepeatMode.One)
                                    }
                                    else if (repeat === RepeatMode.One) {
                                        onRepeatChange(RepeatMode.Random)
                                    }
                                    else {
                                        onRepeatChange(RepeatMode.All)
                                    }
                                }
                            }
                        >
                            {repeatMeta.icon}
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>
            {
                music && (
                    <audio
                        style={{
                            position: 'absolute',
                            zIndex: -100,
                            width: 0,
                            height: 0
                        }}
                        ref={audioRef}
                        preload="auto"
                        onLoadStart={
                            () => setLoading(true)
                        }
                        onLoadedMetadata={
                            () => {
                                const duration = audioRef.current.duration;
                                setDuration(duration);
                                tryToAutoPlay();
                            }
                        }
                        onCanPlay={
                            () => {
                                setLoading(false)
                            }
                        }
                        onCanPlayThrough={
                            () => {
                                setLoading(false)
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
                        onWaiting={
                            () => {
                                setLoading(true)
                            }
                        }
                        onTimeUpdate={
                            () => {
                                if (!seekingRef.current) {
                                    setCurrentTime(audioRef.current.currentTime)
                                }
                            }
                        }
                        onProgress={
                            () => {
                                const audio = audioRef.current;
                                const buffered = audio.buffered;
                                let bufferedEnd: number;
                                try {
                                    bufferedEnd = buffered.end(buffered.length - 1);
                                }
                                catch (err) {
                                    bufferedEnd = 0;
                                }
                                setBuffered(bufferedEnd / audio.duration)
                            }
                        }
                        onSeeked={
                            () => {
                                seekingRef.current = false
                            }
                        }
                        onEnded={
                            () => {
                                audioRef.current.currentTime = 0
                                if (repeat === RepeatMode.One) {
                                    tryToAutoPlay()
                                }
                                else {
                                    onPlayEnd?.(true)
                                }
                            }
                        }
                        onVolumeChange={
                            () => {
                                const volume = audioRef.current.volume;
                                setVolume(volume);
                            }
                        }
                        onError={
                            () => {
                                // audioRef.current.src = music.url;
                                if (hasError.current) {
                                    onPlayEnd?.(false)
                                    setLoading(false)
                                    onPlayStateChange(false)
                                }
                                else {
                                    hasError.current = true;
                                    reloadSong()
                                }
                            }
                        }
                        src={music.url}
                    />
                )
            }
        </Stack>
    )
}

export default MusicPlayer;
