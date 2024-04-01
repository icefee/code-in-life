import React from 'react'

interface SpinProps {
    size?: number;
}

const ColorSpin = ({ size = 32 }: SpinProps) => {
    return (
        <svg
            style={{
                width: size,
                height: size
            }}
            width="44"
            height="44"
            viewBox="0 0 44 44"
        >
            <defs>
                <radialGradient spreadMethod="reflect" id="radial-gradient">
                    <stop offset="0%" stopColor="#03a9f4" />
                    <stop offset="45%" stopColor="#ffc107" />
                    <stop offset="90%" stopColor="#e92929" />
                </radialGradient>
                <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#03a9f4" />
                    <stop offset="100%" stopColor="#e92929" />
                </linearGradient>
            </defs>
            <g fill="none" fillRule="evenodd" strokeWidth="3" stroke="url(#line-gradient)">
                <circle cx="22" cy="22" r="1">
                    <animate attributeName="r"
                        begin="0s"
                        dur="1.8s"
                        values="1; 20"
                        calcMode="spline"
                        keyTimes="0; 1"
                        keySplines="0.165, 0.84, 0.44, 1"
                        repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity"
                        begin="0s"
                        dur="1.8s"
                        values="1; 0"
                        calcMode="spline"
                        keyTimes="0; 1"
                        keySplines="0.3, 0.61, 0.355, 1"
                        repeatCount="indefinite" />
                </circle>
                <circle cx="22" cy="22" r="1">
                    <animate attributeName="r"
                        begin="-0.9s"
                        dur="1.8s"
                        values="1; 20"
                        calcMode="spline"
                        keyTimes="0; 1"
                        keySplines="0.165, 0.84, 0.44, 1"
                        repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity"
                        begin="-0.9s"
                        dur="1.8s"
                        values="1; 0"
                        calcMode="spline"
                        keyTimes="0; 1"
                        keySplines="0.3, 0.61, 0.355, 1"
                        repeatCount="indefinite" />
                </circle>
            </g>
        </svg>
    )
}

export default ColorSpin