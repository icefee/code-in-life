import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

function MusicPlay(props: SvgIconProps) {
    return (
        <SvgIcon {...props}>
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
