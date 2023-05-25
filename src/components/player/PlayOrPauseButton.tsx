import React, { forwardRef, createElement } from 'react';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';

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
            {createElement(playing ? PauseRoundedIcon : PlayArrowRoundedIcon, {
                fontSize: 'inherit'
            })}
        </IconButton>
    )
})

export default PlayOrPauseButton;
