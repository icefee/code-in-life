import { Dispatch, SetStateAction } from 'react';

export interface VideoMeta {
    duration: number;
}

export interface VideoPlayState {
    paused: boolean;
    currentTime: number;
    bufferEnd: number;
    muted: boolean;
    volume: number;
}

export interface VideoLoadState {
    metaLoaded: boolean;
    readyPlay: boolean;
}

type VideoMetaDispatch<T = VideoMeta> = {
    videoMeta: T;
    setVideoMeta: Dispatch<SetStateAction<T>>;
}

type VideoPlayStateDispatch<T = VideoPlayState> = {
    playState: T;
    setPlayState: Dispatch<SetStateAction<T>>;
}

type VideoReadyStateDispatch<T = VideoLoadState> = {
    readyState: T;
    setReadyState: Dispatch<SetStateAction<T>>;
}

type ControlStateDispatch<T = boolean> = {
    controllerShow: T;
    setControllerShow: Dispatch<SetStateAction<T>>;
}

export type PlayerContextType = VideoMetaDispatch & VideoPlayStateDispatch & VideoReadyStateDispatch & ControlStateDispatch;
