import React, { memo, useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BrokenImageOutlined from '@mui/icons-material/BrokenImageOutlined';

type ThumbLoaderProps = {
    src: string;
    retry?: number;
    alt?: string;
    errorText?: string;
    fill?: boolean;
    aspectRatio?: string;
}

function ThumbLoader({ src, retry = 0, errorText = '图片加载失败', fill = false, alt, aspectRatio = '2 / 3' }: ThumbLoaderProps) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const retryTime = useRef(1)
    const imageRef = useRef<HTMLImageElement>()

    const loadImage = (url: string) => {
        const image = new Image();
        image.src = url;
        image.onload = () => {
            setLoading(false)
        }
        image.onerror = () => {
            retryTime.current++;
            if (retryTime.current < retry) {
                setTimeout(() => loadImage(url), 1e3);
            }
            else {
                setLoading(false)
                setError(true)
            }
        }
        imageRef.current = image;
    }

    useEffect(() => {
        loadImage(src)
        return () => {
            imageRef.current.onload = null;
            imageRef.current.onerror = null;
        }
    }, [])

    return (
        <Box sx={fill ? {
            height: '100%',
            overflow: 'hidden'
        } : null}>
            {
                loading ? (
                    <Skeleton sx={{
                        height: '100%',
                        aspectRatio
                    }} animation="wave" variant="rectangular" />
                ) : (
                    error ? (
                        <Stack sx={
                            theme => ({
                                width: '100%',
                                aspectRatio,
                                bgcolor: theme.palette.mode === 'dark' ? '#444' : '#eee',
                                color: '#f44336'
                            })
                        } justifyContent="center" alignItems="center">
                            <BrokenImageOutlined sx={{
                                fontSize: 48
                            }} color="error" />
                            <Typography variant="caption" sx={{ mt: 1, color: 'inherit' }}>{errorText}</Typography>
                        </Stack>
                    ) : (
                        <img
                            style={fill ? {
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            } : {
                                maxWidth: '100%'
                            }}
                            src={src}
                            alt={alt}
                        />
                    )
                )
            }
        </Box>
    )
}

export default memo(ThumbLoader, (prevProps, nextProps) => {
    return prevProps.src === nextProps.src
})
