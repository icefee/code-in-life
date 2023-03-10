import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

interface CancelMutedButtonProps {
    show: boolean;
    left: number;
    bottom: number;
    onClick?: VoidFunction;
}

function CancelMutedButton({ show, left, bottom, onClick }: CancelMutedButtonProps) {
    return (
        <Box sx={(theme) => ({
            position: 'absolute',
            transform: `scale(${show ? 1 : 0})`,
            opacity: show ? 1 : 0,
            transition: 'all .3s',
            color: `var(--status-color, ${theme.palette.primary.main})`,
            left,
            bottom
        })}>
            <Button color="inherit" variant="outlined" size="small" startIcon={
                <VolumeOffIcon />
            } onClick={onClick}>取消静音</Button>
        </Box>
    )
}

export default CancelMutedButton;
