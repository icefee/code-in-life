import React, { useState, useMemo } from 'react';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
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
}

function VolumeSetter({ value, onChange, onMute, disabled = false, IconProps }: VolumeSetterProps) {

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null)
    const volumeIcon = useMemo(() => value > 0 ? value > .5 ? <VolumeUpIcon /> : <VolumeDownIcon /> : <VolumeOffIcon />, [value])

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
                        value={value * 100}
                        disabled={disabled}
                        onChange={
                            (_event, value: number) => {
                                onChange(value / 100)
                            }
                        }
                        orientation="vertical"
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
