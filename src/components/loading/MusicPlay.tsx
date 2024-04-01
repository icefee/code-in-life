import React, { useEffect, useRef, CSSProperties } from 'react'
import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'
import './style.css'

interface MusicPlaySvgProps extends SvgIconProps {
    animating?: boolean;
}

function MusicPlaySvg({ animating = true, ...props }: MusicPlaySvgProps) {

    const svgRef = useRef<SVGSVGElement>()

    useEffect(() => {
        animating ? svgRef.current?.unpauseAnimations() : svgRef.current?.pauseAnimations()
    }, [animating])

    return (
        <SvgIcon ref={svgRef} {...props}>
            <rect x={0} y={0} width={6} height={24}>
                <animate attributeName="y"
                    begin="0"
                    dur="1.5s"
                    values="24; 0; 24"
                    repeatCount="indefinite"
                />
            </rect>
            <rect x={9} y={0} width={6} height={24}>
                <animate attributeName="y"
                    begin="0"
                    dur="1.5s"
                    values="0; 24; 0"
                    repeatCount="indefinite"
                />
            </rect>
            <rect x={18} y={0} width={6} height={24}>
                <animate attributeName="y"
                    begin="0"
                    dur="1.5s"
                    values="12; 0; 24; 12"
                    repeatCount="indefinite"
                />
            </rect>
        </SvgIcon>
    )
}

interface MusicPlayProps {
    animating?: boolean;
    fontSize?: number;
}

function MusicPlay({ animating = false, fontSize = 18 }: MusicPlayProps) {

    const bars = [
        .4,
        -.4,
        -.2,
        -.5
    ];

    return (
        <div style={{
            width: '1em',
            height: '1em',
            aspectRatio: '1 / 1',
            color: 'inherit',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize,
            '--bar-width': '15%'
        } as CSSProperties}>
            {
                bars.map(
                    (delay, index) => (
                        <div style={{
                            width: 'var(--bar-width)',
                            height: '100%',
                            backgroundColor: 'currentcolor',
                            animation: `.8s linear ${delay}s infinite alternate none scale-y`,
                            animationPlayState: animating ? 'running' : 'paused'
                        }} key={index} />
                    )
                )
            }
        </div>
    )
}

export default MusicPlay