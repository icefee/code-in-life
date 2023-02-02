import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { Global } from '@emotion/react';
import { PlayerConfig as config } from './config';
import { timeFormatter } from '../../util/date';

interface MiniProcessProps {
    state: PlayState;
}

function MiniProcess({ state }: MiniProcessProps) {

    const restSeconds = (1 - state.progress) * state.duration;

    return (
        <>
            <Global styles={{
                '.mini-process': {
                    filter: 'blur(5px)',
                    opacity: 0,
                    zIndex: 250
                },
                '.mini-process .rest-label': {
                    display: 'none'
                },
                [`#${config.id}.dplayer-hide-controller + .mini-process`]: {
                    opacity: 1,
                    filter: 'none',
                    transition: 'all .8s ease-in .4s'
                },
                [`#${config.id}.dplayer-hide-controller + .mini-process .rest-label`]: {
                    display: 'block'
                },
                [`#${config.id}.dplayer-fulled + .mini-process`]: {
                    position: 'fixed',
                    zIndex: 3e6
                }
            }} />
            <Box
                className="mini-process"
                sx={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    color: 'var(--status-color)',
                    transition: 'all .3s ease-in-out'
                }}
            >
                <LinearProgress
                    sx={{
                        height: 2,
                        '& .MuiLinearProgress-dashed': {
                            color: 'var(--status-buffer-color)'
                        },
                        '& .MuiLinearProgress-bar1Buffer': {
                            transition: 'none'
                        },
                        '& .MuiLinearProgress-bar2Buffer': {
                            color: 'var(--status-buffer-color)',
                            opacity: 1
                        }
                    }}
                    color="inherit"
                    variant="buffer"
                    value={state.progress * 100}
                    valueBuffer={state.buffered * 100}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                        width: 'calc(var(--played-progress) * 100%)',
                        height: 2,
                        // boxShadow: '0 0 4px var(--status-color)',
                        backgroundColor: 'var(--status-color)',
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
        </>
    )
}

export default MiniProcess;
