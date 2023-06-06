import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { timeFormatter } from '../../util/date';
import type { PlayState } from './VideoPlayer';

interface MiniProcessProps {
    visible: boolean;
    state: PlayState;
}

function MiniProcess({ visible, state }: MiniProcessProps) {

    const restSeconds = (1 - state.progress) * state.duration;

    return (
        <Box
            sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                transition: (theme) => theme.transitions.create('opacity', {
                    duration: '.3s',
                    easing: 'ease-in-out',
                    delay: `${visible ? 2 : 0}s`
                }),
                opacity: visible ? 1 : 0,
                zIndex: 5
            }}
        >
            <LinearProgress
                sx={{
                    height: 2
                }}
                variant="buffer"
                value={state.progress * 100}
                valueBuffer={state.buffered * 100}
            />
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    width: `${state.progress * 100}%`,
                    height: 2,
                    backgroundColor: '#42a5f5',
                    filter: 'blur(4px)'
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 4,
                    right: 6,
                    color: '#fff',
                    transition: (theme) => theme.transitions.create(['transform', 'opacity']),
                    transform: `translate(0, ${visible ? 0 : 30}px)`,
                    opacity: visible ? 1 : 0
                }}>
                <Typography color="inherit" variant="caption">-{timeFormatter(restSeconds)}</Typography>
            </Box>
        </Box>
    )
}

export default MiniProcess;
