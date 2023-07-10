import React, { useState, useRef, useMemo, KeyboardEvent } from 'react';
import Slider, { type SliderProps } from '@mui/material/Slider';
import type { SxProps, Theme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { Instance } from '@popperjs/core';

interface MediaSliderProps extends Omit<SliderProps, 'onMouseMove' | 'onKeyDown'> {
    buffered: number;
    showTooltip?: boolean;
    tooltipFormatter?: (value: number) => string | number;
}

function MediaSlider({ buffered, components, sx, showTooltip = false, tooltipFormatter, disabled, ...props }: MediaSliderProps) {

    const rootRef = useRef<HTMLSpanElement>();
    const positionRef = useRef<{ x: number; y: number }>({
        x: 0,
        y: 0,
    })
    const popperRef = useRef<Instance>(null)
    const [hoverRate, setHoverRate] = useState(0);

    const handleMouseMove = (event: React.MouseEvent) => {
        positionRef.current = { x: event.clientX, y: event.clientY };
        if (popperRef.current != null) {
            popperRef.current.update();
        }
        const rootRect = rootRef.current?.getBoundingClientRect();
        const rate = (positionRef.current.x - rootRect.x) / rootRect.width;
        setHoverRate(rate);
    }

    const commonSx = useMemo<SxProps<Theme>>(
        () => ({
            ...sx,
            height: 3,
            '& .MuiSlider-rail': {
                opacity: 1,
                bgcolor: 'currentcolor',
                backgroundImage: 'linear-gradient(0, #000, #000)',
                overflow: 'hidden',
                '&:before, &:after': {
                    content: '""',
                    position: 'absolute',
                    height: 'inherit',
                    bgcolor: 'inherit',
                    top: 'inherit',
                    transform: 'inherit'
                },
                '&:before': {
                    width: '100%',
                    opacity: .38
                },
                '&:after': {
                    width: buffered * 100 + '%',
                    opacity: .5,
                    transition: (theme) => theme.transitions.create('width')
                }
            },
            '& .MuiSlider-track': {
                backgroundImage: 'linear-gradient(90deg, hsl(0, 50%, 50%), hsl(60deg, 50%, 50%), hsl(180deg, 50%, 50%), currentColor)'
            }
        }),
        [buffered, sx]
    )

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
        }
    }

    /*
    const RootElement = forwardRef<HTMLSpanElement, PropsWithChildren<{
        className: string;
        ownerState: SliderOwnerState;
    }>>(({ children, ...props }, ref) => {

        const rootRef = useRef<HTMLSpanElement>();
        const [hoverRate, setHoverRate] = useState(0);

        useImperativeHandle(ref, () => rootRef.current, []);
        const popperRef = useRef<Instance>(null)

        const handleMouseMove = (event: React.MouseEvent) => {
            positionRef.current = { x: event.clientX, y: event.clientY };
            if (popperRef.current != null) {
                popperRef.current.update();
            }
            const rootRect = rootRef.current?.getBoundingClientRect();
            const rate = (positionRef.current.x - rootRect.x) / rootRect.width;
            setHoverRate(rate);
        }

        return (
            <Tooltip
                title={
                    tooltipFormatter ? tooltipFormatter(hoverRate) : hoverRate
                }
                placement="top"
                arrow
                PopperProps={{
                    popperRef,
                    anchorEl: {
                        getBoundingClientRect: () => {
                            return new DOMRect(
                                positionRef.current.x,
                                rootRef.current?.getBoundingClientRect()?.y,
                                0,
                                0,
                            )
                        },
                    }
                }}
            >
                <SliderRoot
                    ref={rootRef}
                    onMouseMove={handleMouseMove}
                    {...props}
                >
                    {children}
                </SliderRoot>
            </Tooltip>
        )
    });
    */

    if (showTooltip && !disabled) {
        return (
            <Tooltip
                title={
                    tooltipFormatter ? tooltipFormatter(hoverRate) : hoverRate
                }
                placement="top"
                arrow
                PopperProps={{
                    popperRef,
                    anchorEl: {
                        getBoundingClientRect: () => new DOMRect(
                            positionRef.current.x,
                            rootRef.current?.getBoundingClientRect()?.y,
                            0,
                            0,
                        )
                    }
                }}
            >
                <Slider
                    ref={rootRef}
                    onMouseMove={handleMouseMove}
                    onKeyDown={onKeyDown}
                    disabled={disabled}
                    sx={{
                        ...commonSx,
                        '& .MuiSlider-thumb': {
                            width: 0,
                            height: 0,
                            transition: '.2s ease',
                            '&.Mui-active': {
                                width: 16,
                                height: 16,
                            },
                            '&.Mui-focusVisible': {
                                boxShadow: 'none'
                            },
                            '&:after': {
                                display: 'none',
                            }
                        },
                        '&:hover .MuiSlider-thumb': {
                            width: 12,
                            height: 12
                        }
                    }}
                    {...props}
                />
            </Tooltip>
        )
    }

    return (
        <Slider
            sx={commonSx}
            onKeyDown={onKeyDown}
            disabled={disabled}
            {...props}
        />
    )
}

export default MediaSlider;
