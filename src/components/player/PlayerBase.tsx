import React, { useCallback } from 'react';
import loadable from '@loadable/component'

const Player = loadable(() => import('./Player'))

export type VideoParams = {
    seek?: number;
}

interface VideoPlayerProps extends PlayerBaseProps {
    onEnd?: VoidFunction;
    params?: VideoParams;
    onPlaying?: (time: number) => void;
}

function VideoPlayerBase({ url, onEnd, params, onPlaying }: VideoPlayerProps) {

    const onTimeUpdate = useCallback(
        ({ progress, duration }) => onPlaying?.(progress * duration),
        [onPlaying]
    )

    return (
        <Player
            url={url}
            autoplay
            initPlayTime={params?.seek}
            onTimeUpdate={onTimeUpdate}
            onEnd={onEnd}
        />
    )
}

export default VideoPlayerBase;
