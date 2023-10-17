import React, { memo, useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'

type ThumbLoaderProps = {
    src: string;
    alt?: string;
    aspectRatio?: string;
}

function ThumbLoader({ src, alt, aspectRatio = '2 / 3' }: ThumbLoaderProps) {
    const [loading, setLoading] = useState(true)
    const imageRef = useRef<HTMLImageElement | null>(null)

    const hideLoading = () => {
        setLoading(false)
    }

    useEffect(() => {
        if (imageRef.current.complete) {
            hideLoading()
        }
    }, [])

    return (
        <Box sx={{
            position: 'relative',
            aspectRatio
        }}>
            <img
                ref={imageRef}
                style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: loading ? 0 : 1
                }}
                onLoad={hideLoading}
                onError={
                    () => {
                        hideLoading
                        imageRef.current.src = `/image_fail.jpg`;
                    }
                }
                src={src}
                alt={alt}
            />
            {
                loading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        <Skeleton
                            sx={{
                                height: '100%'
                            }}
                            animation="wave"
                            variant="rectangular"
                            component="div"
                        />
                    </Box>
                )
            }
        </Box>
    )
}

export default memo(ThumbLoader, (prevProps, nextProps) => {
    return prevProps.src === nextProps.src
})
