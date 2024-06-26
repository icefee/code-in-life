import React, { useState, useRef, useMemo, KeyboardEvent } from 'react'
import Slider, { type SliderProps } from '@mui/material/Slider'
import type { SxProps, Theme } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import type { Instance } from '@popperjs/core'

interface MediaSliderProps extends Omit<SliderProps, 'onMouseMove' | 'onKeyDown'> {
    buffered?: number;
    showTooltip?: boolean;
    tooltipFormatter?: (value: number) => string | number;
}

function MediaSlider({
    buffered = 0,
    sx,
    showTooltip = false,
    tooltipFormatter,
    disabled,
    ...props
}: MediaSliderProps) {

    const rootRef = useRef<HTMLSpanElement | null>(null)
    const positionRef = useRef<{ x: number; y: number }>({
        x: 0,
        y: 0,
    })
    const popperRef = useRef<Instance | null>(null)
    const [hoverRate, setHoverRate] = useState(0)

    const handleMouseMove = (event: React.MouseEvent) => {
        positionRef.current = {
            x: event.clientX,
            y: event.clientY
        }
        if (popperRef.current != null) {
            popperRef.current.update()
        }
        const rootRect = rootRef.current?.getBoundingClientRect()
        const rate = (positionRef.current.x - rootRect.x) / rootRect.width
        setHoverRate(rate)
    }

    const commonSx = useMemo<SxProps<Theme>>(
        () => ({
            ...sx,
            '& .MuiSlider-rail': {
                color: '#fff',
                opacity: 1,
                bgcolor: 'initial',
                overflow: 'hidden',
                '&:before, &:after': {
                    content: '""',
                    position: 'absolute',
                    height: 'inherit',
                    bgcolor: 'currentcolor',
                    top: 'inherit',
                    transform: 'inherit'
                },
                '&:before': {
                    width: '100%',
                    opacity: .1
                },
                '&:after': {
                    width: 'calc(var(--buffered) * 100%)',
                    opacity: .2,
                    transition: (theme) => theme.transitions.create('width')
                }
            },
            '& .MuiSlider-track': {
                backgroundImage: 'linear-gradient(.25turn, hsl(0, 50%, 50%), hsl(60deg, 50%, 50%), hsl(180deg, 50%, 50%), currentColor)'
            }
        }),
        [sx]
    )

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
        }
    }

    const commonStyles = {
        '--buffered': buffered
    } as React.CSSProperties

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
                    disablePortal: true,
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
                    style={commonStyles}
                    sx={commonSx}
                    onMouseMove={handleMouseMove}
                    onKeyDown={onKeyDown}
                    disabled={disabled}
                    {...props}
                />
            </Tooltip>
        )
    }

    return (
        <Slider
            style={commonStyles}
            sx={commonSx}
            onKeyDown={onKeyDown}
            disabled={disabled}
            {...props}
        />
    )
}

export default MediaSlider