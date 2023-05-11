import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Zoom from '@mui/material/Zoom';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

interface CancelMutedButtonProps {
    show: boolean;
    left: number;
    bottom: number;
    onClick?: VoidFunction;
}

function CancelMutedButton({ show, left, bottom, onClick }: CancelMutedButtonProps) {
    return (
        <Zoom in={show} unmountOnExit>
            <Box sx={{
                position: 'absolute',
                left,
                bottom
            }}>
                <Button variant="outlined" size="small" startIcon={
                    <VolumeOffIcon />
                } onClick={onClick}>取消静音</Button>
            </Box>
        </Zoom>
    )
}

export default CancelMutedButton;
