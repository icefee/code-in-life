import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import PictureInPicture from '@mui/icons-material/PictureInPicture';

interface PictureInPictureButtonProps {
    show: boolean;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
}

function PictureInPictureButton({ show, onClick }: PictureInPictureButtonProps) {
    return (
        <Zoom in={show}>
            <Box sx={(theme) => ({
                position: 'absolute',
                right: 16,
                bottom: 56,
                color: `var(--status-color, ${theme.palette.primary.main})`
            })}>
                <Tooltip title="画中画模式播放" placement="top-start" arrow>
                    <IconButton
                        size="large"
                        color="inherit"
                        onClick={onClick}
                    >
                        <PictureInPicture />
                    </IconButton>
                </Tooltip>
            </Box>
        </Zoom>
    )
}

export default PictureInPictureButton;
