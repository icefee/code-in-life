import React, { useState, type FunctionComponent, type PropsWithChildren } from 'react';
import PlayerContext from './context';
import { type VideoMeta, type VideoPlayState, VideoLoadState } from './type';

const PlayerContainer: FunctionComponent<PropsWithChildren> = ({ children }) => {
    const [videoMeta, setVideoMeta] = useState<VideoMeta>({
        duration: NaN
    })
    const [playState, setPlayState] = useState<VideoPlayState>({
        paused: true,
        currentTime: 0,
        bufferEnd: 0,
        muted: false,
        volume: 1
    })
    const [readyState, setReadyState] = useState<VideoLoadState>({
        metaLoaded: false,
        readyPlay: false
    })
    const [controllerShow, setControllerShow] = useState(true)
    return (
        <PlayerContext.Provider value={{
            videoMeta,
            setVideoMeta,
            playState,
            setPlayState,
            readyState,
            setReadyState,
            controllerShow,
            setControllerShow
        }}>
            {children}
        </PlayerContext.Provider>
    )
}

export default PlayerContainer;
