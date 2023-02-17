interface Hls {
    loadSource(url: string): void;
    attachMedia(video: HTMLVideoElement): void;
    detachMedia(): void;
    on(event: string, listener: (event: unknown) => void): void;
    off(event: string, listener: (event: unknown) => void): void;
    destroy(): void;
}

declare interface HlsConstructor {
    isSupported(): boolean;
    new(): Hls;
    Events: {
        MEDIA_ATTACHED: string;
    }
}

declare const Hls: HlsConstructor;