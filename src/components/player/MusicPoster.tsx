import React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import type { SxProps, Theme } from '@mui/material/styles';

interface MusicPosterProps {
    playing: boolean;
    src?: string;
    alt?: string;
}

function MusicPoster({ playing, src, alt }: MusicPosterProps) {
    const style: SxProps<Theme> = {
        width: '100%',
        height: '100%',
        opacity: .8,
        animationName: 'rotate',
        animationIterationCount: 'infinite',
        animationDuration: '12s',
        animationTimingFunction: 'linear',
        animationPlayState: playing ? 'running' : 'paused'
    };
    return src ? (
        <Avatar
            alt={alt}
            src={src}
            sx={style}
        />
    ) : (
        <Box
            sx={{
                ...style,
                borderRadius: '50%',
                backgroundImage: 'var(--linear-gradient-image)'
            }}
        />
    )
}

export default MusicPoster;