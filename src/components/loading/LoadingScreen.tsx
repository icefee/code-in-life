import React from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Spinner from './Spinner'
import { alpha } from '@mui/material/styles'

interface LoadingScreenProps {
    label?: string;
}

function LoadingScreen({ label = '加载中..' }: LoadingScreenProps) {
    return (
        <Stack
            sx={{
                height: '100%',
                backgroundImage: 'var(--linear-gradient-image)'
            }}
            justifyContent="center"
            alignItems="center"
        >
            <Stack
                sx={({ spacing, palette: { background } }) => ({
                    p: spacing(1, 1.5),
                    backgroundColor: alpha(background.paper, .75),
                    filter: 'drop-shadow(2px 4px 15px #00000030)',
                    borderRadius: 1.5
                })}
                direction="row"
                alignItems="center"
            >
                <Spinner
                    sx={{
                        fontSize: 32
                    }}
                />
                <Typography
                    color="inherit"
                    sx={{
                        textIndent: 8
                    }}
                >{label}</Typography>
            </Stack>
        </Stack>
    )
}

export default LoadingScreen