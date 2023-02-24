import React from 'react';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import type { SxProps, Theme } from '@mui/material/styles';

interface MusicPosterProps {
    spinning?: boolean;
    src?: string;
    alt?: string;
    placeholder?: React.ReactNode;
}

function MusicPoster({ spinning = false, src, alt, placeholder }: MusicPosterProps) {
    const style: SxProps<Theme> = {
        width: '100%',
        height: '100%'
    };
    return src ? (
        <Avatar
            alt={alt}
            src={src}
            sx={{
                ...style,
                opacity: .8,
                animationName: 'rotate',
                animationIterationCount: 'infinite',
                animationDuration: '12s',
                animationTimingFunction: 'linear',
                animationPlayState: spinning ? 'running' : 'paused'
            }}
        />
    ) : (
        <Stack
            justifyContent="center"
            alignItems="center"
            sx={{
                ...style,
                borderRadius: '50%',
                backgroundImage: 'var(--linear-gradient-image)'
            }}
        >
            {placeholder}
        </Stack>
    )
}

export default MusicPoster;