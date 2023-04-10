import React, { useState, useRef, PropsWithChildren, forwardRef, useImperativeHandle } from 'react';
import Slider, { SliderProps, SliderRail, SliderOwnerState } from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import { Instance } from '@popperjs/core';

interface MediaSliderProps extends Omit<SliderProps, 'onMouseMove'> {
    buffered: number;
    showTooltip?: boolean;
    tooltipFormatter?: (value: number) => string | number;
}

function MediaSlider({ buffered, components, sx, showTooltip = false, tooltipFormatter, ...props }: MediaSliderProps) {

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
            <Slider
                ref={rootRef}
                onMouseMove={handleMouseMove}
                sx={{
                    '& .MuiSlider-rail': {
                        opacity: 1,
                        bgcolor: 'currentcolor',
                        backgroundImage: 'linear-gradient(0, #000, #000)',
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
                    '& .MuiSlider-thumb': {
                        '&:after': {
                            display: 'none',
                        }
                    },
                    ...sx
                }}
                {...props}
            />
        </Tooltip>
    )
}

export default MediaSlider;
