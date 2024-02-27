import React, { useState, useEffect, useMemo, useRef } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { alpha } from '@mui/material/styles'
// import PictureInPictureAltRoundedIcon from '@mui/icons-material/PictureInPictureAltRounded';
// import PictureInPictureRoundedIcon from '@mui/icons-material/PictureInPictureRounded';
import RepeatOneRoundedIcon from '@mui/icons-material/RepeatOneRounded'
import LoopRoundedIcon from '@mui/icons-material/LoopRounded'
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded'
import MusicPoster from './MusicPoster'
import MusicLrc from './MusicLrc'
import PlayOrPauseButton from './PlayOrPauseButton'
import VolumeSetter from './VolumeSetter'
import useLocalStorageState from '../hook/useLocalStorageState'
import MediaSlider from './MediaSlider'
import { Spinner } from '../loading'
import AudioVisual from 'react-audio-visual'
import { generate } from '~/util/url'
import { timeFormatter } from '~/util/date'
import { isMobileDevice } from '~/util/env'

export enum RepeatMode {
    All,
    One,
    Random
}

interface MusicPlayerProps {
    music: SearchMusic;
    playing: boolean;
    repeat: RepeatMode;
    extendButtons: React.ReactNode;
    onRepeatChange(mode: RepeatMode): void;
    onPlayStateChange(state: boolean): void;
    onPlayEnd?(end: boolean): void;
    enableVisual?: boolean;
}

function MusicPlayer({
    music,
    playing,
    repeat,
    extendButtons,
    onPlayStateChange,
    onRepeatChange,
    onPlayEnd,
    enableVisual = false
}: MusicPlayerProps) {

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [audioReady, setAudioReady] = useState(false)
    const [duration, setDuration] = useState<number | null>(null)
    const [currentTime, setCurrentTime] = useState<number>(0)
    const [volume, setVolume] = useLocalStorageState<number>('__volume', 1)
    const cachedVolumeRef = useRef<number>(1)
    const [loading, setLoading] = useState(false)
    const isMobile = isMobileDevice()
    const hasError = useRef(false)
    const seekingRef = useRef(false)
    const [buffered, setBuffered] = useState(0)
    const durationPlaceholder = '--:--';

    // const [pip, setPip] = useState(false)

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.currentTime = 0
                setDuration(null)
                setCurrentTime(0)
                setBuffered(0)
                onPlayStateChange(false)
                seekingRef.current = false
                hasError.current = false
            }
        }
    }, [music.url])

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

    const repeatMeta = useMemo(() => {
        return repeat === RepeatMode.All ? {
            label: '列表循环',
            icon: <LoopRoundedIcon />
        } : repeat === RepeatMode.One ? {
            label: '单曲循环',
            icon: <RepeatOneRoundedIcon />
        } : {
            label: '随机播放',
            icon: <ShuffleRoundedIcon />
        }
    }, [repeat])

    useEffect(() => {
        if (volume.init) {
            cachedVolumeRef.current = volume.data
            audioRef.current.volume = volume.data
        }
    }, [volume])

    const tryToAutoPlay = async () => {
        try {
            await audioRef.current.play()
            onPlayStateChange(true)
        }
        catch (err) {
            onPlayStateChange(false)
            setLoading(false)
            console.warn('auto play blocked in case of browser security policy.')
        }
    }

    const reloadSong = () => {
        audioRef.current.src = generate(music.url)
        audioRef.current.load()
    }

    return (
        <Stack
            sx={{
                position: 'relative',
                bgcolor: '#111',
                color: '#fff'
            }}
        >
            <Stack
                sx={{
                    position: 'relative',
                    p: 1,
                    zIndex: 5
                }}
                direction="row"
                alignItems="stretch"
                columnGap={2}
            >
                <Stack
                    sx={(theme) => ({
                        position: 'relative',
                        width: 60,
                        height: 60,
                        aspectRatio: '1 / 1',
                        color: '#fff',
                        transition: theme.transitions.create(['width', 'height']),
                        borderRadius: '50%',
                        [theme.breakpoints.up('sm')]: {
                            width: 64,
                            height: 64
                        }
                    })}
                    justifyContent="center"
                    alignItems="center"
                    flexShrink={0}
                >
                    <Box
                        sx={(theme) => ({
                            width: '100%',
                            height: '100%',
                            bgcolor: '#000',
                            border: '6px solid hsla(0, 0%, 100%, .04)',
                            p: .75,
                            borderRadius: '50%',
                            filter: playing ? `drop-shadow(0px 0px 16px ${alpha(theme.palette.secondary.main, .4)})` : 'none',
                            opacity: loading ? .5 : .8,
                            transition: theme.transitions.create(['opacity', 'filter'])
                        })}
                    >
                        <Box
                            sx={{
                                height: '100%',
                                border: '1px solid #333',
                                borderRadius: '50%'
                            }}
                        >
                            <MusicPoster
                                alt={`${music.name}-${music.artist}`}
                                src={music.poster}
                                spinning={playing && !loading}
                            />
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            opacity: .8,
                            zIndex: 20
                        }}
                    >
                        {
                            loading ? (
                                <Spinner
                                    sx={{
                                        display: 'block',
                                        fontSize: 64
                                    }}
                                />
                            ) : (
                                <PlayOrPauseButton
                                    playing={playing}
                                    onTogglePlay={
                                        (nextState) => {
                                            onPlayStateChange(nextState)
                                        }
                                    }
                                    sx={{
                                        fontSize: '2rem'
                                    }}
                                    size="large"
                                />
                            )
                        }
                    </Box>
                </Stack>
                <Stack
                    justifyContent="space-around"
                    flexGrow={1}
                    sx={{
                        overflow: 'hidden'
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        rowGap={1}
                        columnGap={1}
                    >
                        <Stack
                            sx={(theme) => ({
                                maxWidth: 180,
                                [theme.breakpoints.up('sm')]: {
                                    maxWidth: 300
                                }
                            })}
                        >
                            <Typography
                                variant="body2"
                                title={music.name}
                                noWrap
                            >{music.name}</Typography>
                        </Stack>
                        <Stack>
                            <Typography
                                variant="caption"
                                color="#ffffffcc"
                                title={music.artist}
                                lineHeight={1}
                                noWrap
                            >{music.artist}</Typography>
                        </Stack>
                        <Box
                            sx={{
                                flexGrow: 1,
                                alignSelf: 'flex-start',
                                overflow: 'hidden'
                            }}
                        >
                            <MusicLrc id={music.id} currentTime={currentTime} />
                        </Box>
                    </Stack>
                    <Stack
                        direction="row"
                        alignItems="center"
                    >
                        <Typography
                            variant="button"
                        >{timeFormatter(currentTime)} / {duration ? timeFormatter(duration) : durationPlaceholder}</Typography>
                        <Stack
                            sx={{
                                mx: 2
                            }}
                            flexGrow={1}
                        >
                            <MediaSlider
                                size="small"
                                color="secondary"
                                value={duration ? currentTime / duration : 0}
                                buffered={buffered}
                                showTooltip={!isMobile}
                                max={1}
                                step={.00001}
                                disabled={duration === null}
                                tooltipFormatter={
                                    (value) => timeFormatter(value * duration)
                                }
                                onChange={
                                    (_event, value: number) => {
                                        seekingRef.current = true
                                        setCurrentTime(value * duration)
                                    }
                                }
                                onChangeCommitted={
                                    (_event, value: number) => {
                                        audioRef.current.currentTime = value * duration
                                    }
                                }
                            />
                        </Stack>
                        {
                            !isMobile && (
                                <VolumeSetter.PopUp
                                    value={volume.data}
                                    onChange={
                                        (value) => {
                                            audioRef.current.volume = value;
                                            cachedVolumeRef.current = value;
                                        }
                                    }
                                    onMute={
                                        () => {
                                            if (volume.data > 0) {
                                                audioRef.current.volume = 0;
                                            }
                                            else {
                                                const targetVolume = cachedVolumeRef.current > 0 ? cachedVolumeRef.current : .5;
                                                audioRef.current.volume = targetVolume;
                                            }
                                        }
                                    }
                                    disabled={!audioReady}
                                    IconProps={{
                                        size: 'small'
                                    }}
                                    SliderProps={{
                                        color: 'secondary'
                                    }}
                                />
                            )
                        }
                        {extendButtons}
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
                        {/* <Tooltip title={pip ? '画中画模式' : '退出画中画'}>
                            <IconButton
                                color="inherit"
                                size="small"
                                onClick={
                                    () => {
                                        setPip(
                                            pip => !pip
                                        )
                                    }
                                }
                            >
                                {
                                    pip ? <PictureInPictureAltRoundedIcon /> : <PictureInPictureRoundedIcon />
                                }
                            </IconButton>
                        </Tooltip> */}
                    </Stack>
                </Stack>
                <audio
                    ref={audioRef}
                    preload="auto"
                    onLoadStart={
                        () => setLoading(true)
                    }
                    onDurationChange={
                        (event: React.SyntheticEvent<HTMLVideoElement>) => {
                            setDuration(event.currentTarget.duration);
                        }
                    }
                    onLoadedMetadata={
                        () => {
                            setAudioReady(true);
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
                            if (audioReady) {
                                const buffered = audioRef.current.buffered;
                                let bufferedEnd: number;
                                try {
                                    bufferedEnd = buffered.end(buffered.length - 1);
                                }
                                catch (err) {
                                    bufferedEnd = 0;
                                }
                                setBuffered(bufferedEnd / duration)
                            }
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
                        () => setVolume(audioRef.current.volume)
                    }
                    onError={
                        () => {
                            if (hasError.current) {
                                onPlayEnd?.(false)
                                setLoading(false)
                                onPlayStateChange(false)
                            }
                            else {
                                hasError.current = true
                                setTimeout(reloadSong, 400)
                            }
                        }
                    }
                    src={music.url}
                />
            </Stack>
            {
                enableVisual && (
                    <Box
                        sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 1
                        }}
                    >
                        <AudioVisual
                            audio={audioRef}
                            barInternal={1}
                            barSpace={0}
                            capHeight={1}
                        />
                    </Box>
                )
            }
        </Stack>
    )
}

export default MusicPlayer