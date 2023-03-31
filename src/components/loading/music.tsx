import React, { useEffect, useRef } from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

export interface MusicPlayProps extends SvgIconProps {
    animating?: boolean;
}

function MusicPlay({ animating = true, ...props }: MusicPlayProps) {

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

export default MusicPlay;
