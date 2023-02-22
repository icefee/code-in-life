import React from 'react';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

interface PlayOrPauseButtonProps {
    playing: boolean;
    onTogglePlay(value: boolean): void;
    size?: IconButtonProps['size']
}

function PlayOrPauseButton({ playing, onTogglePlay, size }: PlayOrPauseButtonProps) {
    return (
        <IconButton size={size} color="inherit" onClick={
            () => onTogglePlay(!playing)
        }>
            {React.createElement(playing ? PauseIcon : PlayArrowIcon, {
                fontSize: 'inherit'
            })}
        </IconButton>
    )
}

export default PlayOrPauseButton;
