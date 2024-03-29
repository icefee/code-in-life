import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import { alpha } from '@mui/material/styles';
import { timeFormatter } from '~/util/date';
import type { PlayState } from './VideoPlayer';

type SeekStateProps = {
    state: PlayState;
    seek?: number;
}

export default function SeekState({ state, seek }: SeekStateProps) {

    const currentTime = state.progress * state.duration
    const seconds = Math.max(Math.min(seek, state.duration - currentTime), - currentTime)
    const seekingTime = [Math.max(0, currentTime + seconds), state.duration].map(timeFormatter).join(' / ')

    return seek !== null && (
        <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1e3,
            borderRadius: 2,
            p: 1,
            bgcolor: (theme) => alpha(theme.palette.common.black, .8),
            color: 'primary.main'
        }}>
            <Stack alignItems="center" sx={{
                minWidth: 120
            }}>
                <Box sx={{
                    width: '80%',
                    py: 1
                }}>
                    <LinearProgress
                        sx={{
                            height: 2,
                            '& .MuiLinearProgress-bar1Determinate': {
                                transition: 'none'
                            }
                        }}
                        variant="determinate"
                        value={Math.max(0, currentTime + seconds) * 100 / state.duration}
                    />
                </Box>
                <Stack direction="row" alignItems="center" columnGap={.5}>
                    <Stack justifyContent="center">
                        {React.createElement(seconds > 0 ? FastForwardIcon : FastRewindIcon, {
                            color: 'inherit'
                        })}
                    </Stack>
                    <Stack direction="row" alignItems="flex-end" columnGap={.5}>
                        <Typography variant="caption">快{seconds > 0 ? '进' : '退'}</Typography>
                        <Typography
                            variant="h6"
                            lineHeight={1.2}
                        >{Math.abs(Math.round(seconds))}</Typography>
                        <Typography variant="caption">秒</Typography>
                    </Stack>
                </Stack>
                <Stack justifyContent="center">
                    <Typography variant="caption">{seekingTime}</Typography>
                </Stack>
            </Stack>
        </Box>
    )
}
