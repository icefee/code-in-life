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
                transition: 'all .3s ease-in-out',
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
            <Box
                sx={{
                    position: 'absolute',
                    left: 0,
                    bottom: 2,
                    width: `${state.progress * 100}%`,
                    height: 4,
                    bgcolor: 'primary.dark',
                    filter: 'blur(8px)'
                }}
            />
            <Box
                className="rest-label"
                sx={{
                    position: 'absolute',
                    bottom: 4,
                    right: 6,
                    color: '#fff'
                }}>
                <Typography color="inherit" variant="caption">-{timeFormatter(restSeconds)}</Typography>
            </Box>
        </Box>
    )
}

export default MiniProcess;
