import React, { forwardRef, createElement } from 'react';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

interface PlayOrPauseButtonProps extends Omit<IconButtonProps, 'color' | 'onClick' | 'children'> {
    playing: boolean;
    onTogglePlay(value: boolean): void;
}

const PlayOrPauseButton = forwardRef<HTMLButtonElement, PlayOrPauseButtonProps>(({ playing, onTogglePlay, ...rest }, ref) => {
    return (
        <IconButton
            ref={ref}
            color="inherit"
            onClick={
                () => onTogglePlay(!playing)
            }
            {...rest}
        >
            {createElement(playing ? PauseIcon : PlayArrowIcon, {
                fontSize: 'inherit'
            })}
        </IconButton>
    )
})

export default PlayOrPauseButton;
