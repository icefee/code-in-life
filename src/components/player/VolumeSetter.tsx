import React, { useState, useMemo } from 'react';
import Stack from '@mui/material/Stack';
import Slider, { type SliderProps } from '@mui/material/Slider';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeDownRoundedIcon from '@mui/icons-material/VolumeDownRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';

interface VolumeSetterProps {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
    onMute?: VoidFunction;
    IconProps?: Omit<IconButtonProps, 'onClick'>;
    SliderProps?: Pick<SliderProps, 'color'>;
}

function VolumeSetter({ value, onChange, onMute, disabled = false, IconProps, SliderProps }: VolumeSetterProps) {

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null)
    const volumeIcon = useMemo(() => value > 0 ? value > .5 ? <VolumeUpRoundedIcon /> : <VolumeDownRoundedIcon /> : <VolumeOffRoundedIcon />, [value])

    return (
        <>
            <Tooltip title="音量">
                <IconButton
                    color="inherit"
                    onClick={
                        (event: React.MouseEvent<HTMLButtonElement>) => {
                            setAnchorEl(event.currentTarget);
                        }
                    }
                    {...IconProps}
                >
                    {volumeIcon}
                </IconButton>
            </Tooltip>
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={
                    () => setAnchorEl(null)
                }
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
            >
                <Stack sx={{
                    height: 120,
                    pt: 2
                }} alignItems="center">
                    <Slider
                        size="small"
                        value={value}
                        max={1}
                        step={.00001}
                        disabled={disabled}
                        onChange={
                            (_event, value: number) => {
                                onChange(value)
                            }
                        }
                        orientation="vertical"
                        {...SliderProps}
                    />
                    <IconButton
                        color="inherit"
                        size="small"
                        onClick={onMute}
                    >
                        {volumeIcon}
                    </IconButton>
                </Stack>
            </Popover>
        </>
    )
}

export default VolumeSetter;
