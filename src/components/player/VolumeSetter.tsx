import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import Slider, { type SliderProps } from '@mui/material/Slider';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

interface VolumeSetterProps {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
    onMute?: VoidFunction;
    IconProps?: Omit<IconButtonProps, 'onClick'>;
    SliderProps?: Pick<SliderProps, 'color'>;
}

type ComponentType = React.FC<VolumeSetterProps>;

interface VolumeSetterType {
    PopUp: ComponentType;
    Inline: ComponentType;
}

function getVolumneIcon(value: number) {
    return value > 0 ? value > .5 ? <VolumeUpIcon /> : <VolumeDownIcon /> : <VolumeOffIcon />;
}

function PopUp({ value, onChange, onMute, disabled = false, IconProps, SliderProps }: VolumeSetterProps) {

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null)
    const volumeIcon = getVolumneIcon(value)

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
                disablePortal
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
                        disabled={disabled}
                        onClick={onMute}
                    >
                        {volumeIcon}
                    </IconButton>
                </Stack>
            </Popover>
        </>
    )
}

function Inline({ value, onChange, onMute, disabled = false, IconProps, SliderProps }: VolumeSetterProps) {

    const volumeIcon = getVolumneIcon(value)

    return (
        <Stack
            sx={{
                width: 120
            }}
            direction="row"
            alignItems="center"
            columnGap={.5}
        >
            <Tooltip title="音量">
                <IconButton
                    color="inherit"
                    disabled={disabled}
                    onClick={onMute}
                    {...IconProps}
                >
                    {volumeIcon}
                </IconButton>
            </Tooltip>
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
                {...SliderProps}
            />
        </Stack>
    )
}

const VolumeSetter: VolumeSetterType = {
    PopUp,
    Inline
}

export default VolumeSetter