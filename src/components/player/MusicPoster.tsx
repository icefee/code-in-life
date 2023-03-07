import React from 'react';
import Avatar from '@mui/material/Avatar';

interface MusicPosterProps {
    spinning?: boolean;
    src: string;
    alt?: string;
}

function MusicPoster({ spinning = false, src, alt }: MusicPosterProps) {
    return (
        <Avatar
            alt={alt}
            src={src}
            sx={{
                width: '100%',
                height: '100%',
                opacity: .8,
                animationName: 'rotate',
                animationIterationCount: 'infinite',
                animationDuration: '12s',
                animationTimingFunction: 'linear',
                animationPlayState: spinning ? 'running' : 'paused'
            }}
        />
    )
}

export default MusicPoster;