import React, { useState, useRef, useMemo, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import Hls from 'hls.js';
import Hls2Mp4 from 'hls2mp4';
import PictureInPictureIcon from '@mui/icons-material/PictureInPicture';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import DownloadIcon from '@mui/icons-material/Download';
import MediaSlider from './MediaSlider';
import CancelMutedButton from './CancelMutedButton';
import { DarkThemed } from '../theme';
import PlayOrPauseButton from './PlayOrPauseButton';
import VolumeSetter from './VolumeSetter';
import RateSetter from './RateSetter';

import { timeFormatter } from '../../util/date';
import useLocalStorageState from '../hook/useLocalStorageState';

const StyledVideo = styled('video')({
    display: 'block',
    width: '100%',
    height: '100%'
})

function usePipEvent(ref: React.MutableRefObject<HTMLVideoElement>) {

    const [pip, setPip] = useState<boolean>(false)

    const onEnter = () => {
        setPip(true)
    }

    const onExit = () => {
        setPip(false)
    }

    const togglePip = async () => {
        if (pip) {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture()
            }
        }
        else {
            await ref.current?.requestPictureInPicture()
        }
    }

    useEffect(() => {
        ref.current?.addEventListener('enterpictureinpicture', onEnter);
        ref.current?.addEventListener('leavepictureinpicture', onExit);
        return () => {
            ref.current?.removeEventListener('enterpictureinpicture', onEnter);
            ref.current?.removeEventListener('leavepictureinpicture', onExit);
        }
    }, [])

    return {
        pip,
        togglePip
    }
}

function useFullscreenEvent<T extends HTMLElement>(ref: React.MutableRefObject<T>) {

    const [fullscreen, setFullscreen] = useState<boolean>(false)

    const onChange = () => {
        setFullscreen(document.fullscreenElement !== null)
    }

    const toggleFullscreen = async () => {
        if (fullscreen) {
            if (document.fullscreenElement) {
                await document.exitFullscreen()
            }
        }
        else {
            await ref.current.requestFullscreen()
        }
    }

    useEffect(() => {
        document.addEventListener('fullscreenchange', onChange);
        return () => {
            document.removeEventListener('fullscreenchange', onChange);
        }
    }, [])

    return {
        fullscreen,
        toggleFullscreen
    }
}

function useStatus() {
    const [show, setShow] = useState(false)
    const [statusText, setStatusText] = useState('')
    const outlet = (
        <Fade in={show} unmountOnExit>
            <Box sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                p: 1,
                zIndex: 3
            }}>
                <Typography variant="caption">{statusText}</Typography>
            </Box>
        </Fade>
    )
    return { outlet, setShow, setStatusText }
}

export interface PlayState {
    duration: number;
    progress: number;
    buffered: number;
}

interface VideoPlayerProps {
    url: string;
    title?: string;
    poster?: string;
    hls?: boolean;
    live?: boolean;
    autoplay?: boolean;
    initPlayTime?: number;
    onTimeUpdate?: (state: PlayState) => void;
    onEnd?: VoidFunction;
}

function VideoPlayer({
    url,
    title,
    poster,
    hls: hlsType = false,
    live = false,
    autoplay = false,
    initPlayTime,
    onTimeUpdate,
    onEnd
}: VideoPlayerProps) {

    const videoRef = useRef<HTMLVideoElement>()
    const hls = useRef<Hls>()

    const [playing, setPlaying] = useState(false)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)

    const [volume, setVolume] = useLocalStorageState<number>('__volume', 1)
    const cachedVolumeRef = useRef<number>(1)
    const seekingRef = useRef(false)

    const [buffered, setBuffered] = useState(0)
    const [muted, setMuted] = useState(false)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)
    const durationPlaceholder = '--:--'
    const [controlsShow, setControlsShow] = useState(true)

    const [rate, setRate] = useState(1)
    const { pip, togglePip } = usePipEvent(videoRef)

    const playerRef = useRef<HTMLDivElement>()
    const { fullscreen, toggleFullscreen } = useFullscreenEvent<HTMLDivElement>(playerRef)

    const hls2Mp4 = useRef<Hls2Mp4>()
    const { outlet, setShow, setStatusText } = useStatus()
    const [loading, setLoading] = useState(false)
    const [downloading, setDownloading] = useState(false)

    const [error, setError] = useState(false)

    const videoLoaded = useMemo(() => duration > 0, [duration])

    const initPlayer = () => {
        const video = videoRef.current;
        if (video.canPlayType('application/vnd.apple.mpegurl') || !hlsType) {
            video.src = url;
        }
        else {
            if (Hls.isSupported()) {
                if (!hls.current) {
                    hls.current = new Hls();
                }
                hls.current.loadSource(url);
                hls.current.attachMedia(video);
            }
            else {
                console.error('The browser does not support hls')
            }
        }
    }

    const playVideo = async () => {
        try {
            await videoRef.current.play()
        }
        catch (err) {
            videoRef.current.muted = true;
            setMuted(true);
            playVideo();
        }
    }

    const pauseVideo = () => {
        videoRef.current.pause();
    }

    const disposePlayer = () => {
        hls.current?.detachMedia();
    }

    const showLoading = () => {
        setLoading(true)
    }

    const hideLoading = () => {
        setLoading(false)
    }

    const fastSeek = (dur: number) => {
        videoRef.current.currentTime = Math.max(
            0,
            Math.min(duration, currentTime + dur)
        )
    }

    useEffect(() => {
        initPlayer()
        return () => {
            setDuration(0)
            setMuted(false)
            setError(false)
            disposePlayer()
        }
    }, [url])

    const downloadVideo = async () => {
        if (hlsType) {
            setDownloading(true)
            if (!hls2Mp4.current) {
                hls2Mp4.current = new Hls2Mp4({
                    log: true
                }, (type, progress) => {
                    if (type === 0) {
                        if (progress === 0) {
                            setShow(true)
                            setStatusText('解析视频地址')
                        }
                        else {
                            setStatusText('视频地址解析完成')
                        }
                    }
                    else if (type === 1) {
                        setStatusText(`下载视频分片: ${Math.round(progress * 100)}%`)
                    }
                    else if (type === 2) {
                        if (progress === 0) {
                            setStatusText('合并视频分片')
                        }
                        else {
                            setShow(false)
                        }
                    }
                })
            }
            const buffer = await hls2Mp4.current.download(
                url.startsWith('http:') ? url : new URL(url, document.location.href).href
            )
            hls2Mp4.current.saveToFile(buffer, `${title ?? 'download'}.mp4`)
            setDownloading(false)
        }
        else {
            window.open(url)
        }
    }

    useEffect(() => {
        return () => {
            hls.current?.destroy();
        }
    }, [])

    const actionTrigger = (callback: VoidFunction) => {
        return videoLoaded ? callback : null
    }

    return (
        <DarkThemed>
            <Stack
                sx={{
                    position: 'relative',
                    height: '100%',
                    bgcolor: 'common.black',
                    color: 'common.white'
                }}
                ref={playerRef}
                onMouseEnter={
                    () => {
                        if (!isMobile) {
                            setControlsShow(true)
                        }
                    }
                }
                onMouseLeave={
                    () => {
                        if (!isMobile) {
                            setControlsShow(false)
                        }
                    }
                }
            >
                <Box sx={{
                    height: '100%',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent'
                }} onClick={
                    () => {
                        if (isMobile) {
                            setControlsShow(
                                controlsShow => !controlsShow
                            )
                        }
                        else {
                            if (playing) {
                                pauseVideo()
                            }
                            else {
                                playVideo()
                            }
                        }
                    }
                } onDoubleClick={
                    () => {
                        if (isMobile) {
                            if (playing) {
                                pauseVideo()
                            }
                            else {
                                playVideo()
                            }
                        }
                        else {
                            toggleFullscreen()
                        }
                    }
                }>
                    <StyledVideo
                        ref={videoRef}
                        preload="auto"
                        onLoadStart={showLoading}
                        onWaiting={showLoading}
                        playsInline
                        onDurationChange={
                            (event: React.SyntheticEvent<HTMLVideoElement>) => {
                                setDuration(event.currentTarget.duration)
                            }
                        }
                        onLoadedMetadata={
                            () => {
                                if (autoplay) {
                                    playVideo()
                                }
                                if (initPlayTime > 0) {
                                    videoRef.current.currentTime = initPlayTime;
                                }
                            }
                        }
                        onCanPlay={hideLoading}
                        onPlay={
                            () => {
                                setPlaying(true)
                            }
                        }
                        onPause={
                            () => {
                                setPlaying(false)
                            }
                        }
                        onSeeked={
                            () => {
                                seekingRef.current = false
                            }
                        }
                        onTimeUpdate={
                            (event: React.SyntheticEvent<HTMLVideoElement>) => {
                                const currentTime = event.currentTarget.currentTime;
                                if (!seekingRef.current) {
                                    setCurrentTime(currentTime);
                                }
                                onTimeUpdate?.({
                                    progress: currentTime / duration,
                                    buffered,
                                    duration
                                })
                            }
                        }
                        onProgress={
                            () => {
                                const buffered = videoRef.current.buffered;
                                setBuffered(
                                    buffered.length > 0 ? buffered.end(buffered.length - 1) / duration : 0
                                )
                            }
                        }
                        onVolumeChange={
                            () => setVolume(videoRef.current.volume)
                        }
                        onRateChange={
                            () => setRate(videoRef.current.playbackRate)
                        }
                        onError={
                            () => setError(true)
                        }
                        onEnded={onEnd}
                    />
                </Box>
                <Fade in={poster && !videoLoaded} mountOnEnter unmountOnExit>
                    <Box
                        sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 1,
                            background: `url(${poster}) no-repeat center center`,
                            backgroundSize: 'cover'
                        }}
                    />
                </Fade>
                <Fade in={loading} unmountOnExit>
                    <Stack sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 2
                    }} justifyContent="center" alignItems="center">
                        <CircularProgress />
                    </Stack>
                </Fade>
                <Fade in={error} unmountOnExit>
                    <Stack sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 3
                    }} justifyContent="center" alignItems="center">
                        <Alert severity="error">视频加载失败</Alert>
                    </Stack>
                </Fade>
                <CancelMutedButton
                    show={muted}
                    left={16}
                    bottom={controlsShow ? live ? 60 : 100 : 25}
                    onClick={
                        () => {
                            videoRef.current.muted = false;
                            setMuted(false);
                        }
                    }
                />
                {outlet}
                <Fade in={controlsShow} timeout={800} mountOnEnter>
                    <Stack
                        sx={{
                            position: 'absolute',
                            left: 0,
                            bottom: 0,
                            right: 0,
                            backdropFilter: 'blur(2px)',
                            p: 1
                        }}
                    >
                        {
                            !live && (
                                <Stack
                                    sx={{
                                        px: 1
                                    }}
                                    spacing={1.5}
                                    direction="row"
                                    alignItems="center">
                                    <Typography variant="button">{timeFormatter(currentTime)}</Typography>
                                    <Stack flexGrow={1}>
                                        <MediaSlider
                                            value={videoLoaded ? currentTime / duration : 0}
                                            max={1}
                                            step={.0000001}
                                            disabled={!videoLoaded}
                                            buffered={buffered}
                                            showTooltip={!isMobile && videoLoaded}
                                            tooltipFormatter={
                                                (value) => timeFormatter(value * duration)
                                            }
                                            onChange={
                                                (_event, value: number) => {
                                                    if (playing) {
                                                        pauseVideo();
                                                    }
                                                    seekingRef.current = true;
                                                    const nextPlayTime = value * duration;
                                                    videoRef.current.currentTime = nextPlayTime;
                                                    setCurrentTime(nextPlayTime);
                                                }
                                            }
                                            onChangeCommitted={
                                                () => setTimeout(playVideo, 200)
                                            }
                                            size="small"
                                        />
                                    </Stack>
                                    <Typography variant="button">{videoLoaded ? timeFormatter(duration) : durationPlaceholder}</Typography>
                                </Stack>
                            )
                        }
                        <Stack direction="row" justifyContent="space-between">
                            <Stack direction="row">
                                <PlayOrPauseButton
                                    playing={playing}
                                    onTogglePlay={
                                        (nextState) => {
                                            if (nextState) {
                                                playVideo()
                                            }
                                            else {
                                                pauseVideo();
                                            }
                                        }
                                    }
                                />
                                {
                                    !isMobile && (
                                        <VolumeSetter
                                            value={volume.data}
                                            onChange={
                                                (value) => {
                                                    videoRef.current.volume = value;
                                                    cachedVolumeRef.current = value;
                                                }
                                            }
                                            onMute={
                                                () => {
                                                    if (volume.data > 0) {
                                                        setVolume(0)
                                                        videoRef.current.volume = 0;
                                                    }
                                                    else {
                                                        const targetVolume = cachedVolumeRef.current > 0 ? cachedVolumeRef.current : .5;
                                                        setVolume(targetVolume);
                                                        videoRef.current.volume = targetVolume;
                                                    }
                                                }
                                            }
                                        />
                                    )
                                }
                                {
                                    !live && (
                                        <>
                                            <Tooltip title="快退10秒">
                                                <IconButton
                                                    color="inherit"
                                                    onClick={actionTrigger(() => fastSeek(-10))}
                                                >
                                                    <FastRewindIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="快进10秒">
                                                <IconButton
                                                    color="inherit"
                                                    onClick={actionTrigger(() => fastSeek(10))}
                                                >
                                                    <FastForwardIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    )
                                }
                            </Stack>
                            <Stack direction="row">
                                {
                                    !live && (
                                        <RateSetter
                                            value={rate}
                                            onChange={
                                                (rate) => {
                                                    videoRef.current.playbackRate = rate
                                                }
                                            }
                                        />
                                    )
                                }
                                <Tooltip title={`${fullscreen ? '退出' : '进入'}全屏`}>
                                    <IconButton
                                        color="inherit"
                                        onClick={actionTrigger(toggleFullscreen)}
                                    >
                                        {
                                            fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />
                                        }
                                    </IconButton>
                                </Tooltip>
                                {
                                    !live && (
                                        <Tooltip title="下载">
                                            <IconButton
                                                color="inherit"
                                                onClick={downloading ? null : actionTrigger(downloadVideo)}
                                            >
                                                <DownloadIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )
                                }
                                <Tooltip title={`${pip ? '退出' : '进入'}画中画`}>
                                    <IconButton
                                        color="inherit"
                                        onClick={actionTrigger(togglePip)}
                                    >
                                        {
                                            pip ? <PictureInPictureAltIcon /> : <PictureInPictureIcon />
                                        }
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Stack>
                    </Stack>
                </Fade>
            </Stack>
        </DarkThemed>
    )
}

export default VideoPlayer;
