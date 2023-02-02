declare module 'dplayer' {
    export type ContextMenu = {
        text: string;
        link?: string;
        click(player: DPlayer): void;
    }
    type VideoOption = {
        url: string;
        pic?: string;
        thumb?: string;
        type: string;
        customType?: Record<string, (video: HTMLVideoElement, player: DPlayer) => void>;
    };
    type DPlayerOptions = {
        container: HTMLElement;
        live?: boolean;
        autoplay?: boolean;
        video: VideoOption;
        theme?: string;
        contextmenu?: ContextMenu[];
    }
    // interface DPlayer {
    //     seek: (arg: number) => void;
    // }
    // interface Video {
    //     currentTime: number;
    // }
    export default class DPlayer {
        video: HTMLVideoElement;
        // new(options: DPlayerOptions): DPlayer;
        constructor(options: DPlayerOptions): DPlayer;
        play: VoidFunction;
        pause: VoidFunction;
        toggle: VoidFunction;
        seek: (arg: number) => void;
        on: (event: string, eventHandler: (ev?: Event) => void) => void;
        switchVideo: (video: Omit<VideoOption, 'customType'>) => void;
        destroy: VoidFunction;
        notice: (message: string, duration = 2000, opacity = .8) => void;
    }
}