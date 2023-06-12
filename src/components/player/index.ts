import type { ForwardRefExoticComponent } from 'react';
import loadable from '@loadable/component';
import type { VideoPlayerProps, PlayState } from './VideoPlayer';

const VideoPlayer: ForwardRefExoticComponent<VideoPlayerProps & React.RefAttributes<HTMLVideoElement>> = loadable(() => import('../../components/player/VideoPlayer'))

export {
    VideoPlayer,
    VideoPlayerProps,
    PlayState
}
