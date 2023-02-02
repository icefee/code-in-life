import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlayerConfig as config } from './config';
import DPlayer, { ContextMenu } from 'dplayer';
import { M3u8 } from '../../util/RegExp';
import PictureInPictureButton from './PictureInPictureButton';
import CancelMutedButton from './CancelMutedButton';
import MiniProcess from './MiniProcess';
import SeekState from './SeekState';

interface PlayerProps {
    url: string;
    poster?: string;
    live?: boolean;
    autoplay?: boolean;
    theme?: string;
    contextmenu?: ContextMenu[];
    initPlayTime?: number;
    muted?: boolean;
    pip?: boolean;
    onReady?: (player: DPlayer) => void;
    onTimeUpdate?: (state: PlayState) => void;
    onEnd?: VoidFunction;
}

function Player({
    url,
    poster = config.poster,
    live = false,
    autoplay = false,
    theme = config.theme,
    contextmenu = [],
    initPlayTime,
    muted = true,
    pip = true,
    onReady,
    onTimeUpdate,
    onEnd
}: PlayerProps) {

    const containerRef = useRef<HTMLDivElement>()
    const playerRef = useRef<DPlayer>()
    const [playerReady, setPlayerReady] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [inPipMode, setInPipMode] = useState(false)
    const [touchOrigin, setTouchOrigin] = useState(0)
    const [seekingDuration, setSeekingDuration] = useState<number | null>(null)

    const [playState, setPlayState] = useState<PlayState>({
        duration: 0,
        progress: 0,
        buffered: 0
    })

    const [noticeShow, setNoticeShow] = useState(false)

    const updateProgress = useCallback(() => {
        setPlayState(state => ({
            ...state,
            progress: playerRef.current.video.currentTime / state.duration
        }))
    }, [playState])

    const onVideoTimeUpdate = useCallback(() => {
        if (playerReady) {
            updateProgress()
        }
    }, [playerReady])

    const playVideo = async () => {

        const video = playerRef.current.video;

        try {
            await video.play()
        }
        catch (err) {
            video.muted = true;
            setIsMuted(true);
            playVideo();
        }

    }

    const onLoadedMetaData = useCallback(() => {

        if (initPlayTime) {
            playerRef.current.seek(initPlayTime);
        }

        if (autoplay) {
            playVideo()
        }

        setPlayerReady(true)

        setPlayState(state => ({
            ...state,
            duration: playerRef.current.video.duration
        }))

        onReady?.(playerRef.current)

    }, [initPlayTime, autoplay, live, setPlayerReady])

    useEffect(() => {
        if (playerReady) {
            onTimeUpdate?.(playState)
        }
    }, [playerReady, playState])

    useEffect(() => {

        let type = 'auto';

        if (M3u8.isM3u8Url(url)) {
            type = 'hls';
        }

        const player = new DPlayer({
            container: containerRef.current,
            live,
            autoplay,
            theme,
            contextmenu,
            video: {
                url,
                pic: poster,
                type,
                customType: config.customType
            }
        })

        if (muted) {
            // player.video.defaultMuted = true;
        }

        player.on('notice_show', () => setNoticeShow(true))
        player.on('notice_hide', () => setNoticeShow(false))
        player.on('loadedmetadata', onLoadedMetaData)

        player.on('ended', () => {
            onEnd?.()
        })

        player.video.onenterpictureinpicture = () => setInPipMode(true)
        player.video.onleavepictureinpicture = () => setInPipMode(false)

        if (!playerRef.current) {
            player.notice(config.notice, 3000);
        }
        playerRef.current = player;

        return () => {
            setPlayerReady(false)
            setIsMuted(false)
            setNoticeShow(false)
            setInPipMode(false)
            setPlayState(state => ({
                ...state,
                progress: 0,
                buffered: 0
            }))
            if (inPipMode && document.pictureInPictureElement) {
                document.exitPictureInPicture()
            }
            player.video.onenterpictureinpicture = null;
            player.video.onleavepictureinpicture = null;
            player?.destroy()
        }
    }, [url])

    const onProgress = useCallback(() => {
        if (!live && playerReady) {
            const buffered = playerRef.current.video.buffered;
            let bufferedEnd: number;
            try {
                bufferedEnd = buffered.end(buffered.length - 1);
            }
            catch (err) {
                bufferedEnd = 0;
            }
            setPlayState(state => ({
                ...state,
                buffered: bufferedEnd / state.duration
            }))
        }
    }, [playerReady])

    const onSeeking = useCallback(() => {
        if (!live && playerReady) {
            updateProgress()
        }
    }, [playerReady])

    useEffect(() => {
        if (playerReady) {
            playerRef.current.on('timeupdate', onVideoTimeUpdate)
        }
    }, [onVideoTimeUpdate])

    useEffect(() => {
        if (playerReady) {
            playerRef.current.on('progress', onProgress)
        }
    }, [onProgress])

    useEffect(() => {
        if (playerReady) {
            playerRef.current.on('seeking', onSeeking)
        }
    }, [onSeeking])

    const seekTo = (duration: number) => {
        playerRef.current.seek(
            Math.max(
                0,
                Math.min(duration, playState.duration)
            )
        )
    }

    return (
        <div style={{
            position: 'relative',
            height: '100%',
            ...(live ? null : {
                '--played-progress': playState.progress,
                '--status-color': theme,
                '--status-buffer-color': config.themeBuffer
            })
        } as React.CSSProperties}>
            <div
                id={config.id}
                ref={containerRef}
                style={{
                    height: '100%',
                    pointerEvents: playerReady ? 'unset' : 'none'
                }}
                onTouchStart={
                    (event: React.TouchEvent<HTMLDivElement>) => {
                        if (!live) {
                            setTouchOrigin(event.touches[0].clientX)
                        }
                    }
                }
                onTouchMove={
                    (event: React.TouchEvent<HTMLDivElement>) => {
                        if (!live && playerReady) {
                            const touchs = event.changedTouches;
                            const wrapWidth = (event.target as HTMLDivElement).clientWidth;
                            const duration = (touchs[0].clientX - touchOrigin) * Math.max(playState.duration / wrapWidth / 2, 1);
                            setSeekingDuration(duration);
                        }
                    }
                }
                onTouchEnd={
                    () => {
                        if (!live && playerReady) {
                            if (Math.abs(seekingDuration) > 1) {
                                const nextPlayTime = Math.max(
                                    0,
                                    Math.min(
                                        playerRef.current.video.currentTime + seekingDuration,
                                        playState.duration
                                    )
                                );
                                seekTo(nextPlayTime)
                            }
                            setSeekingDuration(null)
                        }
                    }
                }
                onDoubleClick={
                    () => {
                        if (!live && playerReady) {
                            playerRef.current.toggle()
                        }
                    }
                }
            />
            {
                !live && playerReady && (
                    <>
                        <MiniProcess
                            state={playState}
                        />
                        <SeekState
                            video={playerRef.current.video}
                            duration={seekingDuration}
                        />
                    </>
                )
            }
            <PictureInPictureButton
                show={pip && playerReady && !inPipMode}
                onClick={async () => {
                    try {
                        await playerRef.current.video.requestPictureInPicture()
                    }
                    catch (err) {
                        playerRef.current.notice(config.pipNotSupported)
                    }
                }}
            />
            <CancelMutedButton
                show={playerReady && isMuted}
                left={16}
                bottom={56 + Number(noticeShow) * 36}
                onClick={
                    () => {
                        playerRef.current.video.muted = false;
                        setIsMuted(false);
                    }
                }
            />
        </div>
    )
}

export default Player;
