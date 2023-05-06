import React, { useState, useRef, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import Hls from 'hls.js';
import Hls2Mp4 from 'hls2mp4';
import PictureInPictureIcon from '@mui/icons-material/PictureInPicture';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import DownloadIcon from '@mui/icons-material/Download';
import { PlayerConfig as config } from './config';
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

function usePipEvent(ref: React.MutableRefObject<HTMLVideoElement>, initState: boolean) {

    const [pip, setPip] = useState<boolean>(initState)

    const onEnter = () => {
        setPip(true)
    }

    const onExit = () => {
        setPip(false)
    }

    useEffect(() => {
        ref.current.addEventListener('enterpictureinpicture', onEnter);
        ref.current.addEventListener('leavepictureinpicture', onExit);
        return () => {
            ref.current.removeEventListener('enterpictureinpicture', onEnter);
            ref.current.removeEventListener('leavepictureinpicture', onExit);
        }
    }, [])

    return [pip, setPip]
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
    poster = config.poster,
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

    const [buffered, setBuffered] = useState(0)
    const [muted, setMuted] = useState(false)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)
    const durationPlaceholder = '--:--'
    const [controlsShow, setControlsShow] = useState(true)

    const [rate, setRate] = useState(1)
    const [pip] = usePipEvent(videoRef, false)

    const hls2Mp4 = useRef<Hls2Mp4>()
    const { outlet, setShow, setStatusText } = useStatus()
    const [loading, setLoading] = useState(false)
    const [downloading, setDownloading] = useState(false)

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

    const onLoadedMetaData: React.ReactEventHandler<HTMLVideoElement> = (event) => {
        setDuration(event.currentTarget.duration)
        if (autoplay) {
            playVideo()
        }
        if (initPlayTime > 0) {
            videoRef.current.currentTime = initPlayTime;
        }
    }

    const disposePlayer = () => {
        hls.current?.detachMedia();
    }

    const fastSeek = (duration: number) => {
        videoRef.current.currentTime = Math.max(
            0,
            Math.min(duration, currentTime + duration)
        )
    }

    useEffect(() => {
        initPlayer()
        return () => {
            setDuration(0)
            setMuted(false)
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
                        setStatusText(`下载视频分片: ${Math.round(progress * 100)}`)
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
            const buffer = await hls2Mp4.current.download(url)
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

    return (
        <DarkThemed>
            <Stack
                sx={{
                    position: 'relative',
                    height: '100%',
                    bgcolor: 'common.black',
                    color: 'common.white'
                }}
                onMouseEnter={
                    () => setControlsShow(true)
                }
                onMouseLeave={
                    () => setControlsShow(false)
                }
            >
                <Box sx={{
                    height: '100%',
                    cursor: 'pointer'
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
                }>
                    <StyledVideo
                        ref={videoRef}
                        onLoadStart={
                            () => setLoading(true)
                        }
                        onWaiting={
                            () => {
                                setLoading(true)
                            }
                        }
                        onLoadedMetadata={onLoadedMetaData}
                        onCanPlay={
                            () => {
                                setLoading(false)
                                setControlsShow(false)
                            }
                        }
                        onCanPlayThrough={
                            () => {
                                setLoading(false)
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
                            () => {
                                const currentTime = videoRef.current.currentTime;
                                setCurrentTime(currentTime);
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
                                setBuffered(buffered.end(buffered.length - 1) / duration)
                            }
                        }
                        onSeeked={playVideo}
                        onVolumeChange={
                            () => setVolume(videoRef.current.volume)
                        }
                        onRateChange={
                            () => setRate(videoRef.current.playbackRate)
                        }
                        onEnded={onEnd}
                    />
                </Box>
                <Fade in={poster && duration === 0} mountOnEnter unmountOnExit>
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
                <CancelMutedButton
                    show={muted}
                    left={16}
                    bottom={90}
                    onClick={
                        () => {
                            videoRef.current.muted = false;
                            setMuted(false);
                        }
                    }
                />
                {outlet}
                <Fade in={controlsShow} mountOnEnter>
                    <Stack
                        sx={{
                            position: 'absolute',
                            left: 0,
                            bottom: 0,
                            right: 0,
                            backdropFilter: 'blur(4px)',
                            p: 1
                        }}
                    >
                        {
                            !live && (
                                <Stack
                                    sx={{
                                        px: 1
                                    }}
                                    spacing={2}
                                    direction="row"
                                    alignItems="center">
                                    <Typography variant="button">{timeFormatter(currentTime)}</Typography>
                                    <Stack flexGrow={1}>
                                        <MediaSlider
                                            value={duration > 0 ? (currentTime * 100 / duration) : 0}
                                            buffered={buffered}
                                            showTooltip={!isMobile && duration > 0}
                                            tooltipFormatter={
                                                (value) => timeFormatter(value * duration)
                                            }
                                            onChange={
                                                (_event, value: number) => {
                                                    pauseVideo();
                                                    videoRef.current.currentTime = value * duration / 100;
                                                    setCurrentTime(value * duration / 100)
                                                }
                                            }
                                            size="small"
                                        />
                                    </Stack>
                                    <Typography variant="button">{duration > 0 ? timeFormatter(duration) : durationPlaceholder}</Typography>
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
                                                    onClick={
                                                        () => fastSeek(-10)
                                                    }
                                                >
                                                    <FastRewindIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="快进10秒">
                                                <IconButton
                                                    color="inherit"
                                                    onClick={
                                                        () => fastSeek(10)
                                                    }
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
                                <Tooltip title={`${pip ? '退出' : '进入'}画中画`}>
                                    <IconButton
                                        color="inherit"
                                        onClick={
                                            async () => {
                                                if (pip) {
                                                    if (document.pictureInPictureElement) {
                                                        await document.exitPictureInPicture()
                                                    }
                                                }
                                                else {
                                                    await videoRef.current.requestPictureInPicture()
                                                }
                                            }
                                        }
                                    >
                                        {
                                            pip ? <PictureInPictureAltIcon /> : <PictureInPictureIcon />
                                        }
                                    </IconButton>
                                </Tooltip>
                                {
                                    !live && (
                                        <Tooltip title="下载">
                                            <IconButton
                                                color="inherit"
                                                onClick={downloadVideo}
                                                disabled={downloading}
                                            >
                                                <DownloadIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )
                                }
                            </Stack>
                        </Stack>
                    </Stack>
                </Fade>
            </Stack>
        </DarkThemed>
    )
}

export default VideoPlayer;
