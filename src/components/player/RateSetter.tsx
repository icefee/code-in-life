import React, { useState } from 'react';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TimesOneMobiledataRoundedIcon from '@mui/icons-material/TimesOneMobiledataRounded';

interface RateSetterProps {
    value: number;
    onChange: (value: number) => void;
    IconProps?: Omit<IconButtonProps, 'onClick'>;
}

function RateSetter({ value, onChange, IconProps }: RateSetterProps) {

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null)
    const rates = [0.5, 0.75, 1, 1.25, 1.75, 2]

    const handleClose = () => {
        setAnchorEl(null)
    }

    return (
        <>
            <Tooltip title="倍速">
                <IconButton
                    color="inherit"
                    onClick={
                        (event: React.MouseEvent<HTMLButtonElement>) => {
                            setAnchorEl(event.currentTarget);
                        }
                    }
                    {...IconProps}
                >
                    <TimesOneMobiledataRoundedIcon />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0, 0, 0, .32))',
                            mb: 1.5,
                            '&:before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                bottom: -8,
                                left: '50%',
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translate(-50%, -50%) rotate(45deg)',
                                zIndex: 0
                            }
                        }
                    }
                }}
                disablePortal
            >
                {
                    rates.map(
                        (rate, index) => (
                            <MenuItem
                                key={index}
                                onClick={
                                    () => {
                                        handleClose()
                                        onChange(rate)
                                    }
                                }
                                sx={{
                                    justifyContent: 'center'
                                }}
                                selected={value === rate}
                                dense
                            >{rate === 1 ? '正常' : rate}</MenuItem>
                        )
                    )
                }
            </Menu>
        </>
    )
}

export default RateSetter;
