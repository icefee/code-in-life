import React, { memo, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { Api } from '../../util/config';

type ThumbLoaderProps = {
    src: string;
    alt?: string;
    aspectRatio?: string;
}

function ThumbLoader({ src, alt, aspectRatio = '2 / 3' }: ThumbLoaderProps) {
    const [loading, setLoading] = useState(true)
    const imageRef = useRef<HTMLImageElement>()
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
                    objectFit: 'cover'
                }}
                onLoad={
                    () => setLoading(false)
                }
                onError={
                    () => {
                        setLoading(false);
                        imageRef.current.src = `${Api.staticAsset}/assets/image_fail.jpg`;
                    }
                }
                hidden={loading}
                src={src}
                alt={alt}
            />
            {
                loading && (
                    <Skeleton
                        sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            right: 0,
                            height: '100%'
                        }}
                        animation="wave"
                        variant="rectangular"
                        component="div"
                    />
                )
            }
        </Box>
    )
}

export default memo(ThumbLoader, (prevProps, nextProps) => {
    return prevProps.src === nextProps.src
})
