import React, { CSSProperties, ReactEventHandler, useRef, useEffect, useContext } from 'react';
import PlayerContext from './context';
import { type PlayerContextType } from './type';
import Controller from './controller';

const styles: Record<string, CSSProperties> = {
    wraper: {
        position: 'relative',
        height: '100%',
        backgroundColor: '#000'
    },
    video: {
        display: 'block',
        width: '100%',
        height: '100%'
    }
}

interface CustomType {
    (video: HTMLVideoElement, url: string): Hls;
}

interface PlayerProps {
    url: string;
    autoplay?: boolean;
    hls?: boolean;
    customType?: Record<string, CustomType>;
}

function Player({ url, autoplay = false, hls: hlsType = false, customType = {} }: PlayerProps) {

    const videoRef = useRef<HTMLVideoElement>()
    const hlsRef = useRef<Hls>()
    const context = useContext<PlayerContextType>(PlayerContext)

    const playVideo = async () => {
        const video = videoRef.current;
        context.setVideoMeta(
            state => ({
                ...state,
                duration: video.duration
            })
        )
        try {
            await video.play()
            context.setPlayState(state => ({
                ...state,
                paused: false
            }))
        }
        catch (err) {
            video.muted = true;
            playVideo();
        }
    }

    const onLoadedMetaData: ReactEventHandler<HTMLVideoElement> = (event) => {
        const video = event.target as HTMLVideoElement;
        context.setVideoMeta(state => ({
            ...state,
            duration: video.duration
        }));
        context.setReadyState(state => ({
            ...state,
            metaLoaded: true
        }))
        if (autoplay) {
            playVideo()
        }
    }

    const onTimeUpdate: ReactEventHandler<HTMLVideoElement> = (event) => {
        const video = event.target as HTMLVideoElement;
        context.setPlayState(state => ({
            ...state,
            currentTime: video.currentTime
        }))
    }

    const initPlayer = () => {
        const video = videoRef.current;
        try {
            if (video.canPlayType('application/vnd.apple.mpegurl') || !hlsType) {
                video.src = url;
            }
            else {
                let hlsIns: Hls;
                if ('hls' in customType) {
                    const hls = customType.hls(video, url)
                    hlsIns = hls;
                }
                else if ('Hls' in window) {
                    if (!Hls.isSupported()) {
                        throw new Error('Hls not support')
                    }
                    const hls = new Hls();
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hlsIns = hls;
                }
                else {
                    throw new Error('Can not find Hls.')
                }
                hlsRef.current = hlsIns;
            }
            context.setReadyState(state => ({
                ...state,
                readyPlay: true
            }))
        }
        catch (err) {
            console.error(err)
        }
    }

    const disposePlayer = () => {
        hlsRef.current.detachMedia();
        hlsRef.current.destroy();
    }

    useEffect(() => {
        initPlayer()
        return () => {
            disposePlayer()
        }
    }, [url])

    useEffect(() => {
        const video = videoRef.current;
        if (context.playState.paused) {
            video.pause()
        }
        else {
            playVideo()
        }
    }, [context.playState.paused])

    const onMouseEnter = () => {
        if (!context.playState.paused) {
            context.setControllerShow(true)
        }
    }

    const onMouseLeave = () => {
        if (!context.playState.paused) {
            context.setControllerShow(false)
        }
    }

    const onProgress: ReactEventHandler<HTMLVideoElement> = (event) => {
        const video = event.target as HTMLVideoElement;
        const buffered = video.buffered;
        let bufferedEnd: number;
        try {
            bufferedEnd = buffered.end(buffered.length - 1);
        }
        catch (err) {
            bufferedEnd = 0;
        }
        context.setPlayState(state => ({
            ...state,
            bufferEnd: bufferedEnd
        }))
    }

    return (
        <div
            style={styles.wraper}
            className="player"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <video
                ref={videoRef}
                style={styles.video}
                onProgress={onProgress}
                onTimeUpdate={onTimeUpdate}
                onEnded={
                    () => {
                        context.setPlayState(state => ({
                            ...state,
                            paused: true
                        }))
                        context.setControllerShow(true)
                    }
                }
                onLoadedMetadata={onLoadedMetaData}
            />
            <Controller />
        </div>
    )
}

export default Player;
