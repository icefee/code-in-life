import React, { forwardRef, createElement } from 'react';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import PlayArrowSharpIcon from '@mui/icons-material/PlayArrowSharp';
import PauseSharpIcon from '@mui/icons-material/PauseSharp';

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
            {createElement(playing ? PauseSharpIcon : PlayArrowSharpIcon, {
                fontSize: 'inherit'
            })}
        </IconButton>
    )
})

export default PlayOrPauseButton;
