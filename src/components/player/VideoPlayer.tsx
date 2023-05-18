import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
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
import MiniProcess from './MiniProcess';
import SeekState from './SeekState';

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
    function wrapper(...args: any[]) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            callback.apply(this, ...args);
        }, delay)
    }
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
    disableDownload = false,
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

    const [buffered, setBuffered] = useState(0)
    const [muted, setMuted] = useState(false)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)
    const durationPlaceholder = '--:--'
    const [controlsShow, setControlsShow] = useState(true)
    const seekingRef = useRef(false)

    const [rate, setRate] = useState(1)
    const { pip, togglePip } = usePipEvent(videoRef)

    const playerRef = useRef<HTMLDivElement>()
    const { fullscreen, toggleFullscreen } = useFullscreenEvent<HTMLDivElement>(playerRef)
    const controlsAutoHideTimeout = useRef<NodeJS.Timeout>()

    const hls2Mp4 = useRef<Hls2Mp4>()
    const { outlet, showStatus } = useStatus()
    const [loading, setLoading] = useState(false)
    const [downloading, setDownloading] = useState(false)

    const [error, setError] = useState(false)
    const [touchOrigin, setTouchOrigin] = useState(0)
    const [seekingDuration, setSeekingDuration] = useState<number | null>(null)

    const videoLoaded = useMemo(() => duration > 0, [duration])

    const onMainfestParsed = () => {
        hls.current.startLoad(initPlayTime)
    }

    const initPlayer = () => {
        const video = videoRef.current;
        if (hlsType) {
            if (Hls.isSupported()) {
                if (!hls.current) {
                    hls.current = new Hls({
                        autoStartLoad: false
                    });
                    hls.current.attachMedia(video);
                }
                hls.current.on(Hls.Events.MANIFEST_PARSED, onMainfestParsed);
                hls.current.loadSource(url);
            }
            else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                video.load();
            }
            else {
                video.src = url;
            }
        }
        else {
            video.src = url;
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

    const showLoading = () => {
        setLoading(true)
    }

    const hideLoading = () => {
        setLoading(false)
    }

    const fastSeek = (time: number) => {
        setCurrentTime(time);
        const video = videoRef.current;
        video.currentTime = Math.max(
            0,
            Math.min(video.duration, time)
        )
    }

    useEffect(() => {
        initPlayer()
        return () => {
            setPlaying(false)
            setBuffered(0)
            setDuration(0)
            setMuted(false)
            setError(false)
            hls.current?.off(Hls.Events.MANIFEST_PARSED, onMainfestParsed)
        }
    }, [url])

    const hotKeysMap: Record<string, (video: HTMLVideoElement, event: KeyboardEvent) => void> = {
        ArrowLeft(video) {
            fastSeek(video.currentTime - 15)
        },
        ArrowRight(video) {
            fastSeek(video.currentTime + 15)
        },
        Space(video, event) {
            event.preventDefault()
            togglePlay(video.paused)
        }
    }

    const onKeyUp = (event: KeyboardEvent) => {
        hotKeysMap[event.code]?.(videoRef.current, event)
    }

    useEffect(() => {
        window.addEventListener('keyup', onKeyUp)
        return () => {
            window.removeEventListener('keyup', onKeyUp)
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
                            showStatus('加载FFmpeg', 2e4)
                        }
                        else {
                            showStatus('FFmpeg加载完成')
                        }
                    }
                    else if (type === TaskType.parseM3u8) {
                        if (progress === 0) {
                            showStatus('解析视频地址')
                        }
                        else {
                            showStatus('视频地址解析完成')
                        }
                    }
                    else if (type === TaskType.downloadTs) {
                        showStatus(`下载视频分片: ${Math.round(progress * 100)}%`)
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
                else if (/video encrypted/.test(err.message)) {
                    showStatus('当前视频被加密, 无法下载')
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

    const playOrPauseButton = useMemo(() => (
        <PlayOrPauseButton
            playing={playing}
            onTogglePlay={videoLoaded ? togglePlay : null}
            sx={{
                fontSize: 'inherit'
            }}
        />
    ), [playing, videoLoaded])

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

    const onMouseMove = () => {
        if (fullscreen) {
            setControlsShow(true)
            resetControlsHideTimeout()
        }
    }

    useEffect(() => {
        if (fullscreen) {
            createControlsHideTimeout()
        }
        else {
            disposeControlsHideTimeout()
        }
    }, [fullscreen])

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
                onMouseMove={isMobile ? null : onMouseMove}
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
                        preload="auto"
                        onLoadStart={showLoading}
                        onWaiting={showLoading}
                        poster={poster}
                        playsInline
                        onDurationChange={
                            (event: React.SyntheticEvent<HTMLVideoElement>) => {
                                setDuration(event.currentTarget.duration)
                            }
                        }
                        onCanPlay={
                            () => {
                                if (autoplay) {
                                    playVideo()
                                }
                                hideLoading()
                            }
                        }
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
                        onTimeUpdate={
                            (event: React.SyntheticEvent<HTMLVideoElement>) => {
                                const video = event.currentTarget;
                                if (!video.seeking && !seekingRef.current) {
                                    setCurrentTime(video.currentTime);
                                    onTimeUpdate?.(state)
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
                    <Fade in={loading} unmountOnExit>
                        <Stack sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 1
                        }} justifyContent="center" alignItems="center">
                            <CircularProgress />
                        </Stack>
                    </Fade>
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
                            backdropFilter: 'blur(2px)',
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
                                                (_event, value: number) => {
                                                    seekingRef.current = true;
                                                    setCurrentTime(value * duration);
                                                }
                                            }
                                            onChangeCommitted={
                                                (_event, value: number) => {
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
                                <Box
                                    sx={{
                                        fontSize: '1.5rem'
                                    }}>
                                    {playOrPauseButton}
                                </Box>
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
                                            <Tooltip title="快退15秒">
                                                <IconButton
                                                    color="inherit"
                                                    onClick={actionTrigger(() => fastSeek(currentTime - 15))}
                                                >
                                                    <FastRewindIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="快进15秒">
                                                <IconButton
                                                    color="inherit"
                                                    onClick={actionTrigger(() => fastSeek(currentTime + 15))}
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
                                    !live && !disableDownload && (
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
                                            pip ? <PictureInPictureAltIcon /> : <PictureInPictureIcon />
                                        }
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Stack>
                    </Stack>
                </Fade>
                <Fade in={isMobile && controlsShow && !loading && !error} timeout={400} mountOnEnter>
                    <Box
                        sx={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 3,
                            fontSize: '3rem'
                        }}>
                        <Box
                            sx={{
                                opacity: .8
                            }}>
                            {playOrPauseButton}
                        </Box>
                    </Box>
                </Fade>
                {
                    !isMobile && !loading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                transform: `translate(-50%, -50%) scale(${playing ? 2.5 : 1})`,
                                opacity: playing ? 0 : .75,
                                transition: (theme) => theme.transitions.create(['transform', 'opacity']),
                                zIndex: 3,
                                fontSize: '3rem'
                            }}>
                            {playOrPauseButton}
                        </Box>
                    )
                }
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
}

export default VideoPlayer;
