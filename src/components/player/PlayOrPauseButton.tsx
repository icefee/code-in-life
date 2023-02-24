import React, { forwardRef } from 'react';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

interface PlayOrPauseButtonProps {
    playing: boolean;
    onTogglePlay(value: boolean): void;
    size?: IconButtonProps['size'];
}

const PlayOrPauseButton = forwardRef<HTMLButtonElement, PlayOrPauseButtonProps>(({ playing, onTogglePlay, size, ...rest }, ref) => {
    return (
        <IconButton ref={ref} size={size} color="inherit" onClick={
            () => onTogglePlay(!playing)
        } {...rest}>
            {React.createElement(playing ? PauseIcon : PlayArrowIcon, {
                fontSize: 'inherit'
            })}
        </IconButton>
    )
})

export default PlayOrPauseButton;
