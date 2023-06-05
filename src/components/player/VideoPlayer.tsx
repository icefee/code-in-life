import React, { useState, useRef, useMemo, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { styled, alpha } from '@mui/material/styles';
import Hls from 'hls.js';
import Hls2Mp4 from 'hls2mp4';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import PictureInPictureRoundedIcon from '@mui/icons-material/PictureInPictureRounded';
import PictureInPictureAltRoundedIcon from '@mui/icons-material/PictureInPictureAltRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import Replay10RoundedIcon from '@mui/icons-material/Replay10Rounded';
import Forward10RoundedIcon from '@mui/icons-material/Forward10Rounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import useLocalStorageState from '../hook/useLocalStorageState';
import MediaSlider from './MediaSlider';
import CancelMutedButton from './CancelMutedButton';
import { DarkThemed } from '../theme';
import PlayOrPauseButton from './PlayOrPauseButton';
import VolumeSetter from './VolumeSetter';
import RateSetter from './RateSetter';
import MiniProcess from './MiniProcess';
import SeekState from './SeekState';
import { timeFormatter } from '../../util/date';
import { isMobileDevice } from '../../util/env';

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

function useFullscreenEvent() {

    const [fullscreen, setFullscreen] = useState(false)

    const onChange = () => {
        setFullscreen(document.fullscreenElement !== null)
    }

    useEffect(() => {
        document.addEventListener('fullscreenchange', onChange);
        return () => {
            document.removeEventListener('fullscreenchange', onChange);
        }
    }, [])

    return {
        fullscreen
    }
}

function useStatus() {
    const [show, setShow] = useState(false)
    const [statusText, setStatusText] = useState('')
    const timeoutRef = useRef<NodeJS.Timeout>()
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
    const showStatus = (text: string, duration = 3e3) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        setStatusText(text)
        setShow(true)
        timeoutRef.current = setTimeout(() => {
            setShow(false)
        }, duration)
    }
    return { outlet, showStatus }
}

function debounce(delay: number, callback: (args: any[]) => void) {

    let timeout = null;

    function cancel() {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    }

    function wrapper(...args: any[]) {
        cancel()
        timeout = setTimeout(() => {
            callback.apply(this, ...args);
        }, delay)
    }

    wrapper.cancel = cancel;

    return wrapper;
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
    disableDownload?: boolean;
    onTimeUpdate?: (state: PlayState) => void;
    onNext?: VoidFunction;
    onEnd?: VoidFunction;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(({
    url,
    title,
    poster,
    hls: hlsType = false,
    live = false,
    autoplay = false,
    initPlayTime = 0,
    disableDownload = false,
    onTimeUpdate,
    onNext,
    onEnd
}, ref) => {

    const videoRef = useRef<HTMLVideoElement>()
    const hls = useRef<Hls>()

    const [playing, setPlaying] = useState(false)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)

    const [volume, setVolume] = useLocalStorageState<number>('__volume', 1)
    const cachedVolumeRef = useRef<number>(1)

    const [buffered, setBuffered] = useState(0)
    const [muted, setMuted] = useState(false)
    const isMobile = isMobileDevice()
    const durationPlaceholder = '--:--'
    const [controlsShow, setControlsShow] = useState(true)
    const seekingRef = useRef(false)
    const autoPlayEventFired = useRef(false)

    const [rate, setRate] = useState(1)
    const { pip, togglePip } = usePipEvent(videoRef)

    const playerRef = useRef<HTMLDivElement>()
    const { fullscreen } = useFullscreenEvent()
    const controlsAutoHideTimeout = useRef<NodeJS.Timeout>()

    const hls2Mp4 = useRef<Hls2Mp4>()
    const { outlet, showStatus } = useStatus()
    const [loading, setLoading] = useState(false)
    const [downloading, setDownloading] = useState(false)

    const [error, setError] = useState(false)
    const [touchOrigin, setTouchOrigin] = useState(0)
    const [seekingDuration, setSeekingDuration] = useState<number | null>(null)

    useImperativeHandle(ref, () => videoRef.current, [])

    const videoLoaded = useMemo(() => duration > 0, [duration])

    const onMainfestParsed = () => {
        hls.current.startLoad(initPlayTime)
    }

    const onMediaAttached = () => {
        tryToAutoPlay()
    }

    const initPlayer = () => {
        const video = videoRef.current;
        if (hlsType && Hls.isSupported()) {
            if (!hls.current) {
                hls.current = new Hls({
                    autoStartLoad: false
                });
                hls.current.attachMedia(video);
            }
            hls.current.on(Hls.Events.MANIFEST_PARSED, onMainfestParsed);
            hls.current.on(Hls.Events.MEDIA_ATTACHED, onMediaAttached);
            hls.current.loadSource(url);
            // video.canPlayType('application/vnd.apple.mpegurl')
        }
        else {
            video.src = url;
            video.load();
        }
    }

    const playVideo = async () => {
        try {
            await videoRef.current.play()
        }
        catch (err) {
            if (err.name === 'NotAllowedError') {
                videoRef.current.muted = true;
                setMuted(true);
                setTimeout(playVideo, 0);
            }
        }
    }

    const pauseVideo = () => {
        videoRef.current.pause();
    }

    const togglePlay = (state: boolean) => {
        if (state) {
            playVideo()
        }
        else {
            pauseVideo();
        }
    }

    const tryToAutoPlay = () => {
        if (autoplay && !autoPlayEventFired.current) {
            autoPlayEventFired.current = true
            playVideo()
        }
    }

    const showLoading = () => {
        setLoading(true)
    }

    const hideLoading = () => {
        setLoading(false)
    }

    const toggleFullscreen = async () => {
        if (fullscreen) {
            if (document.fullscreenElement) {
                await document.exitFullscreen()
            }
        }
        else if (document.fullscreenEnabled) {
            await playerRef.current.requestFullscreen()
        }
        else {
            /* @ts-ignore */
            await videoRef.current.webkitEnterFullscreen()
        }
    }

    const showMessage = (message: string) => {
        if (!downloading) {
            showStatus(message)
        }
    }

    const setVolumeWithMessage = (volume: number) => {
        setVolume(volume)
        if (!isMobile) {
            showMessage(`设置音量为${Math.round(volume * 100)}%`)
        }
    }

    const fastSeek = (time: number) => {
        const video = videoRef.current;
        const nextPlayTime = Math.max(
            0,
            Math.min(video.duration, time)
        );
        if (nextPlayTime > video.currentTime && video.currentTime < video.duration || nextPlayTime < video.currentTime && video.currentTime > 0) {
            setCurrentTime(nextPlayTime);
            showMessage(`快${nextPlayTime > video.currentTime ? '进' : '退'}${Math.round(Math.abs(nextPlayTime - video.currentTime))}秒`);
            video.currentTime = nextPlayTime;
        }
    }

    useEffect(() => {
        initPlayer()
        return () => {
            setPlaying(false)
            setCurrentTime(0)
            setBuffered(0)
            setDuration(0)
            setMuted(false)
            setError(false)
            if (videoRef.current) {
                videoRef.current.muted = false
            }
            autoPlayEventFired.current = false
            hls.current?.off(Hls.Events.MANIFEST_PARSED, onMainfestParsed)
        }
    }, [url])

    useEffect(() => {
        if (volume.init) {
            videoRef.current.volume = volume.data;
        }
    }, [volume])

    const hotKeysMap: Record<string, (video: HTMLVideoElement, event: KeyboardEvent) => void> = {
        ArrowLeft(video) {
            fastSeek(video.currentTime - 10)
        },
        ArrowRight(video) {
            fastSeek(video.currentTime + 10)
        },
        ArrowUp(video) {
            video.volume = Math.min(1, video.volume + .1)
        },
        ArrowDown(video) {
            video.volume = Math.max(0, video.volume - .1)
        },
        Space(video) {
            togglePlay(video.paused)
        }
    }

    const onKeyUp = (event: KeyboardEvent) => {
        const bindAction = hotKeysMap[event.code];
        if (bindAction) {
            event.preventDefault();
            bindAction(videoRef.current, event);
        }
    }

    useEffect(() => {
        if (!isMobile) {
            window.addEventListener('keyup', onKeyUp)
        }
        return () => {
            if (!isMobile) {
                window.removeEventListener('keyup', onKeyUp)
            }
            hls.current?.detachMedia();
            hls.current?.destroy();
        }
    }, [])

    const downloadVideo = async () => {
        if (hlsType) {
            if (downloading) {
                return;
            }
            setDownloading(true)
            if (!hls2Mp4.current) {
                hls2Mp4.current = new Hls2Mp4({
                    // corePath: new URL('/ffmpeg/ffmpeg-core.js', document.location.href).href,
                    // wasmPath: '/api/ffmpeg-core.wasm',
                    log: true,
                    maxRetry: 5,
                    tsDownloadConcurrency: 20
                }, (type, progress) => {
                    const TaskType = Hls2Mp4.TaskType;
                    if (type === TaskType.loadFFmeg) {
                        if (progress === 0) {
                            showStatus('加载FFmpeg', 1e6)
                        }
                        else {
                            showStatus('FFmpeg加载完成')
                        }
                    }
                    else if (type === TaskType.parseM3u8) {
                        if (progress === 0) {
                            showStatus('解析视频地址', 3e4)
                        }
                        else {
                            showStatus('视频地址解析完成')
                        }
                    }
                    else if (type === TaskType.downloadTs) {
                        showStatus(`下载视频分片: ${Math.round(progress * 100)}%`, 1e4)
                    }
                    else if (type === TaskType.mergeTs) {
                        if (progress === 0) {
                            showStatus('合并视频分片', 1e4)
                        }
                        else {
                            showStatus('视频分片合并完成')
                        }
                    }
                })
            }
            try {
                const buffer = await hls2Mp4.current.download(url)
                showStatus('正在导出文件..')
                hls2Mp4.current.saveToFile(buffer, `${title ?? 'download'}.mp4`)
            }
            catch (err) {
                if (/FFmpeg load failed/.test(err.message)) {
                    showStatus('FFmpeg 下载失败, 请重试')
                }
                else {
                    showStatus(`下载发生错误: ${err.message}`)
                }
            }
            setDownloading(false)
        }
        else {
            window.open(url)
        }
    }

    const actionTrigger = (callback: VoidFunction) => {
        return videoLoaded ? callback : null
    }

    const state = useMemo<PlayState>(() => ({
        progress: duration > 0 ? currentTime / duration : 0,
        buffered,
        duration
    }), [currentTime, buffered, duration])

    const createControlsHideTimeout = () => {
        controlsAutoHideTimeout.current = setTimeout(() => setControlsShow(false), 2.5e3)
    }

    const disposeControlsHideTimeout = () => {
        if (controlsAutoHideTimeout.current) {
            clearTimeout(controlsAutoHideTimeout.current)
        }
    }

    const resetControlsHideTimeout = useCallback(debounce(2e3, () => {
        disposeControlsHideTimeout()
        createControlsHideTimeout()
    }), [])

    return (
        <DarkThemed>
            <Stack
                sx={{
                    position: 'relative',
                    height: '100%',
                    bgcolor: 'common.black',
                    color: 'common.white',
                    overflow: 'hidden'
                }}
                ref={playerRef}
                onMouseMove={isMobile ? null : () => {
                    setControlsShow(true)
                    if (playing) {
                        resetControlsHideTimeout()
                    }
                }}
                onMouseLeave={isMobile ? null : () => {
                    if (playing) {
                        setControlsShow(false)
                    }
                    disposeControlsHideTimeout()
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        height: '100%',
                        cursor: 'pointer',
                        WebkitTapHighlightColor: 'transparent'
                    }}
                    onClick={
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
                    }
                    onTouchStart={
                        (event: React.TouchEvent<HTMLDivElement>) => {
                            if (!live && videoLoaded) {
                                const touchs = event.changedTouches;
                                setTouchOrigin(touchs[0].clientX);
                            }
                        }
                    }
                    onTouchMove={
                        (event: React.TouchEvent<HTMLDivElement>) => {
                            if (!live && videoLoaded) {
                                const touchs = event.changedTouches;
                                const wrapWidth = event.currentTarget.clientWidth;
                                const seekingDuration = (touchs[0].clientX - touchOrigin) * Math.max(duration / wrapWidth / 2, 1);
                                setSeekingDuration(seekingDuration);
                            }
                        }
                    }
                    onTouchEnd={
                        () => {
                            if (!live && videoLoaded) {
                                if (Math.abs(seekingDuration) > 1) {
                                    fastSeek(currentTime + seekingDuration)
                                }
                                setSeekingDuration(null)
                            }
                        }
                    }
                >
                    <StyledVideo
                        ref={videoRef}
                        sx={{
                            opacity: controlsShow ? .75 : 1,
                            transition: (theme) => theme.transitions.create('opacity')
                        }}
                        preload="auto"
                        onLoadStart={showLoading}
                        onWaiting={showLoading}
                        onContextMenu={
                            (event) => event.preventDefault()
                        }
                        poster={poster}
                        playsInline
                        onDurationChange={
                            (event: React.SyntheticEvent<HTMLVideoElement>) => {
                                setDuration(event.currentTarget.duration)
                            }
                        }
                        onCanPlay={
                            () => {
                                if (!hls.current) {
                                    if (initPlayTime > 0) {
                                        fastSeek(initPlayTime)
                                    }
                                    tryToAutoPlay()
                                }
                                hideLoading()
                            }
                        }
                        onPlay={
                            () => {
                                createControlsHideTimeout()
                                setPlaying(true)
                            }
                        }
                        onPause={
                            () => {
                                resetControlsHideTimeout.cancel()
                                disposeControlsHideTimeout()
                                setControlsShow(true)
                                setPlaying(false)
                            }
                        }
                        onTimeUpdate={
                            (event: React.SyntheticEvent<HTMLVideoElement>) => {
                                const video = event.currentTarget;
                                if (!seekingRef.current) {
                                    setCurrentTime(video.currentTime);
                                    onTimeUpdate?.(state);
                                }
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
                            () => setVolumeWithMessage(videoRef.current.volume)
                        }
                        onRateChange={
                            () => setRate(videoRef.current.playbackRate)
                        }
                        onError={
                            () => setError(true)
                        }
                        onEnded={onEnd}
                    />
                    <Fade in={loading} unmountOnExit>
                        <Stack sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 1,
                            color: '#fff'
                        }} justifyContent="center" alignItems="center">
                            <CircularProgress color="inherit" />
                        </Stack>
                    </Fade>
                    {
                        !live && (
                            <>
                                <Tooltip title="快退10秒">
                                    <Fade in={controlsShow && videoLoaded} unmountOnExit>
                                        <IconButton
                                            color="inherit"
                                            onClick={
                                                (event: React.SyntheticEvent<HTMLButtonElement, Event>) => {
                                                    event.stopPropagation();
                                                    fastSeek(currentTime - 10);
                                                }
                                            }
                                            sx={{
                                                position: 'absolute',
                                                left: isMobile ? '50%' : 16,
                                                top: '50%',
                                                transform: `translate(${isMobile ? 'calc(-50% - 88px)' : 0}, -50%)`,
                                                zIndex: 2
                                            }}
                                            size="large"
                                        >
                                            <Replay10RoundedIcon fontSize="inherit" />
                                        </IconButton>
                                    </Fade>
                                </Tooltip>
                                <Tooltip title="快进10秒">
                                    <Fade in={controlsShow && videoLoaded} unmountOnExit>
                                        <IconButton
                                            color="inherit"
                                            onClick={
                                                (event: React.SyntheticEvent<HTMLButtonElement, Event>) => {
                                                    event.stopPropagation();
                                                    fastSeek(currentTime + 10);
                                                }
                                            }
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                transform: `translate(${isMobile ? 'calc(-50% + 88px)' : 0}, -50%)`,
                                                zIndex: 2,
                                                ...(isMobile ? {
                                                    left: '50%'
                                                } : {
                                                    right: 16
                                                })
                                            }}
                                            size="large"
                                        >
                                            <Forward10RoundedIcon fontSize="inherit" />
                                        </IconButton>
                                    </Fade>
                                </Tooltip>
                            </>
                        )
                    }
                    {
                        !isMobile && !loading && (
                            <PlayOrPauseButton
                                playing={playing}
                                onTogglePlay={videoLoaded ? togglePlay : null}
                                sx={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    transform: `translate(-50%, -50%) scale(${playing ? 2.5 : 1})`,
                                    opacity: playing ? 0 : 1,
                                    transition: (theme) => theme.transitions.create(['transform', 'opacity']),
                                    zIndex: 2,
                                    fontSize: '3rem'
                                }}
                            />
                        )
                    }
                </Box>
                <Fade in={poster && !videoLoaded} mountOnEnter unmountOnExit>
                    <Box
                        sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 4,
                            background: `url(${poster}) no-repeat center center`,
                            backgroundSize: 'cover'
                        }}
                    />
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
                            backgroundImage: (theme) => `linear-gradient(0, ${alpha(theme.palette.common.black, .8)}, transparent)`,
                            p: 1,
                            zIndex: 3
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
                                                (event, value: number) => {
                                                    if (isMobile && event.type === 'mousedown') {
                                                        return;
                                                    }
                                                    setCurrentTime(value * duration);
                                                    seekingRef.current = true;
                                                }
                                            }
                                            onChangeCommitted={
                                                (event, value: number) => {
                                                    if (isMobile && event.type === 'mouseup') {
                                                        return;
                                                    }
                                                    fastSeek(value * duration);
                                                    seekingRef.current = false;
                                                }
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
                                <Tooltip title={playing ? '暂停' : '播放'}>
                                    <PlayOrPauseButton
                                        playing={playing}
                                        onTogglePlay={videoLoaded ? togglePlay : null}
                                    />
                                </Tooltip>
                                {
                                    onNext && (
                                        <Tooltip title="播放下一个">
                                            <IconButton
                                                color="inherit"
                                                onClick={onNext}
                                            >
                                                <SkipNextRoundedIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )
                                }
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
                                                        videoRef.current.volume = 0;
                                                    }
                                                    else {
                                                        const targetVolume = cachedVolumeRef.current > 0 ? cachedVolumeRef.current : .5;
                                                        videoRef.current.volume = targetVolume;
                                                    }
                                                }
                                            }
                                        />
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
                                            fullscreen ? <FullscreenExitRoundedIcon /> : <FullscreenRoundedIcon />
                                        }
                                    </IconButton>
                                </Tooltip>
                                {
                                    !live && !disableDownload && (
                                        <Tooltip title="下载">
                                            <IconButton
                                                color="inherit"
                                                onClick={downloading ? null : actionTrigger(downloadVideo)}
                                            >
                                                <DownloadRoundedIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )
                                }
                                <Tooltip title={`${pip ? '退出' : '进入'}画中画`}>
                                    <IconButton
                                        color="inherit"
                                        onClick={actionTrigger(
                                            async () => {
                                                try {
                                                    await togglePip()
                                                }
                                                catch (err) {
                                                    showStatus('当前浏览器不支持画中画')
                                                }
                                            }
                                        )}
                                    >
                                        {
                                            pip ? <PictureInPictureAltRoundedIcon /> : <PictureInPictureRoundedIcon />
                                        }
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Stack>
                    </Stack>
                </Fade>
                <Fade in={isMobile && controlsShow && !loading && !error} timeout={400} mountOnEnter>
                    <PlayOrPauseButton
                        playing={playing}
                        onTogglePlay={videoLoaded ? togglePlay : null}
                        sx={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 3,
                            fontSize: '3.2rem'
                        }}
                    />
                </Fade>
                {
                    !live && (
                        <>
                            <MiniProcess
                                visible={videoLoaded && !controlsShow}
                                state={state}
                            />
                            <SeekState
                                state={state}
                                seek={seekingDuration}
                            />
                        </>
                    )
                }
            </Stack>
        </DarkThemed>
    )
})

export default VideoPlayer;
