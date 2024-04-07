import React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Zoom from '@mui/material/Zoom'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import type { SxProps, Theme } from '@mui/material/styles'

interface CancelMutedButtonProps {
    show: boolean;
    sx?: SxProps<Theme>;
    onClick?: VoidFunction;
}

function CancelMutedButton({ show, sx, onClick }: CancelMutedButtonProps) {
    return (
        <Zoom in={show} unmountOnExit>
            <Box sx={{
                position: 'absolute',
                ...sx
            }}>
                <Button variant="outlined" size="small" startIcon={
                    <VolumeOffIcon />
                } onClick={onClick}>取消静音</Button>
            </Box>
        </Zoom>
    )
}

export default CancelMutedButton