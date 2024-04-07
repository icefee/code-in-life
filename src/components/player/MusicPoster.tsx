import React, { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Skeleton from '@mui/material/Skeleton'

interface MusicPosterProps {
    spinning?: boolean;
    src: string;
    alt?: string;
}

function MusicPoster({ spinning = false, src, alt }: MusicPosterProps) {

    const [poster, setPoster] = useState(null)
    const loadError = useRef(false)

    useEffect(() => {
        return () => {
            setPoster(null)
            loadError.current = false
        }
    }, [src])

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%'
            }}
        >
            <Avatar
                alt={alt}
                src={poster ?? src}
                slotProps={{
                    img: {
                        loading: 'lazy',
                        onLoad() {
                            if (!loadError.current) {
                                setPoster(src)
                            }
                        },
                        onError() {
                            loadError.current = true
                            setPoster('/poster.jpg')
                        }
                    }
                }}
                sx={{
                    width: '100%',
                    height: '100%',
                    opacity: poster ? 1 : 0,
                    animationName: 'rotate',
                    animationIterationCount: 'infinite',
                    animationDuration: '12s',
                    animationTimingFunction: 'linear',
                    animationPlayState: spinning ? 'running' : 'paused',
                    transition: (theme) => theme.transitions.create('opacity')
                }}
            />
            {
                poster === null && (
                    <Skeleton
                        variant="circular"
                        sx={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            left: 0,
                            top: 0
                        }}
                    />
                )
            }
        </Box>
    )
}

export default MusicPoster