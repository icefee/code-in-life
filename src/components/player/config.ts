import DPlayer from 'dplayer';
import Hls from 'hls.js'

export abstract class PlayerConfig {

    public static id = 'player';
    
    public static theme = 'hsl(calc(200 * (1 - var(--played-progress, 0))), 100%, 50%)';

    public static themeBuffer = 'hsl(calc(200 * (1 - var(--played-progress, 0))), 100%, 20%)';
    
    public static linearGradient = 'linear-gradient(90deg, #008ab7, #65b71e, orange, #bd0b0b) no-repeat calc(var(--played-progress, 0) * 100%) center / var(--player-width, 100vw) auto'

    public static get hlsSupported() {
        return Hls.isSupported()
    }
    public static poster = '/assets/poster.webp';
    public static customType = {
        hls(video: HTMLVideoElement, _player: DPlayer) {
            const hls = new Hls();
            hls.loadSource(video.src);
            hls.attachMedia(video);
        }
    }
    public static notice = '视频采集自第三方网站, 请勿相信任何字幕广告';
    public static pipNotSupported = '当前浏览器不支持画中画模式.';
}
