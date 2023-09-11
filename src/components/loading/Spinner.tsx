import React, { useId } from 'react'
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'

function Spinner(props: SvgIconProps) {
    const id = useId()
    return (
        <SvgIcon {...props}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <defs>
                    <radialGradient spreadMethod="reflect">
                        <stop offset="0%" stopColor="#03a9f4" />
                        <stop offset="45%" stopColor="#ffc107" />
                        <stop offset="90%" stopColor="#e92929" />
                    </radialGradient>
                    <linearGradient id={`line-gradient-${id}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#03a9f4" />
                        <stop offset="100%" stopColor="#e92929" />
                    </linearGradient>
                </defs>
                <path
                    fill={`url(#line-gradient-${id})`}
                    d="M2,12A11.2,11.2,0,0,1,13,1.05C12.67,1,12.34,1,12,1a11,11,0,0,0,0,22c.34,0,.67,0,1-.05C6,23,2,17.74,2,12Z">
                    <animateTransform attributeName="transform" dur="0.6s" repeatCount="indefinite" type="rotate"
                        values="0 12 12;360 12 12" />
                </path>
            </svg>
        </SvgIcon>
    )
}

export default Spinner