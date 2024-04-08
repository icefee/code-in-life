import React from 'react'
import GlobalStyles from '@mui/material/GlobalStyles'

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
        <div
            style={{
                width: '1em',
                height: '1em',
                aspectRatio: '1 / 1',
                color: 'inherit',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                fontSize,
                '--bar-width': '15%'
            } as React.CSSProperties}
        >
            <GlobalStyles
                styles={
                    `
                    @keyframes scale-y {
                        from {
                            height: 100%;
                        }
                        to {
                            height: 0;
                        }
                    }
                    `
                }
            />
            {
                bars.map(
                    (delay, index) => (
                        <div
                            style={{
                                width: 'var(--bar-width)',
                                height: '100%',
                                backgroundColor: 'currentcolor',
                                animation: `.8s linear ${delay}s infinite alternate none scale-y`,
                                animationPlayState: animating ? 'running' : 'paused'
                            }}
                            key={index}
                        />
                    )
                )
            }
        </div>
    )
}

export default MusicPlay