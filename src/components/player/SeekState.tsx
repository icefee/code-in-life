import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import { alpha } from '@mui/material/styles';
import { timeFormatter } from '../../util/date';

type SeekStateProps = {
    video: HTMLVideoElement;
    duration?: number;
}

export default function SeekState({ video, duration }: SeekStateProps) {

    const seconds = Math.round(
        Math.max(Math.min(duration, video.duration - video.currentTime), - video.currentTime)
    );

    const seekingTime = [Math.max(0, video.currentTime + seconds), video.duration].map(timeFormatter).join(' / ')

    return duration && (
        <Box sx={(theme) => ({
            position: 'absolute',
            bottom: 50,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1e8,
            borderRadius: 2,
            p: 1,
            bgcolor: alpha(theme.palette.common.black, .75),
            color: '#fff'
        })}>
            <Stack alignItems="center" sx={{
                minWidth: 120
            }}>
                <Box sx={{
                    width: '80%',
                    py: 1,
                    color: 'var(--status-color)'
                }}>
                    <LinearProgress
                        sx={{
                            height: 2,
                            '& .MuiLinearProgress-bar1Buffer': {
                                transition: 'none'
                            }
                        }}
                        color="inherit"
                        variant="determinate"
                        value={Math.max(0, video.currentTime + seconds) * 100 / video.duration}
                    />
                </Box>
                <Stack direction="row" alignItems="center" columnGap={.5}>
                    <Stack justifyContent="center" sx={{
                        color: 'var(--status-color)'
                    }}>
                        {React.createElement(seconds > 0 ? FastForwardIcon : FastRewindIcon, {
                            color: 'inherit'
                        })}
                    </Stack>
                    <Stack direction="row" alignItems="flex-end" columnGap={.5}>
                        <Typography variant="caption">快{seconds > 0 ? '进' : '退'}</Typography>
                        <Typography
                            variant="h6"
                            lineHeight={1.2}
                            color="var(--status-color)"
                        >{Math.abs(seconds)}</Typography>
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
