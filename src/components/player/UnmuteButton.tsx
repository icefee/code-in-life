import React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import type { SxProps, Theme } from '@mui/material/styles'

interface UnmuteButtonProps {
    show: boolean;
    sx?: SxProps<Theme>;
    onClick?: VoidFunction;
}

function UnmuteButton({ show, sx, onClick }: UnmuteButtonProps) {
    return (
        <Fade in={show} unmountOnExit>
            <Box sx={{
                position: 'absolute',
                ...sx
            }}>
                <Button variant="outlined" size="small" startIcon={
                    <VolumeOffIcon />
                } onClick={onClick}>取消静音</Button>
            </Box>
        </Fade>
    )
}

export default UnmuteButton