import React, { memo, useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useTheme, type SxProps, type Theme } from '@mui/material/styles'
import { generate } from '~/util/url'
import { Api } from '~/util/config'

type ImageProps = React.JSX.IntrinsicElements['img']

type ThumbLoaderProps = Omit<ImageProps, 'style' | 'onLoad' | 'onError'> & {
    src: string;
    aspectRatio?: string;
}

function ThumbLoader({
    src,
    aspectRatio = '2 / 3',
    ...props
}: ThumbLoaderProps) {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const imageRef = useRef<HTMLImageElement>(null!)
    const { palette } = useTheme()

    const commonSx: SxProps<Theme> = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0
    }

    const showLoading = () => {
        setLoading(true)
    }

    const hideLoading = () => {
        setLoading(false)
    }

    useEffect(() => {
        if (!imageRef.current.complete) {
            showLoading()
        }
    }, [src])

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                aspectRatio,
                bgcolor: palette.mode === 'dark' ? '#444' : '#eee'
            }}
        >
            <img
                style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    opacity: error ? 0 : 1,
                    objectFit: 'cover'
                }}
                ref={imageRef}
                src={src}
                onLoad={hideLoading}
                onError={
                    () => {
                        hideLoading()
                        setError(true)
                    }
                }
                {...props}
            />
            {
                loading && (
                    <Skeleton
                        sx={{
                            ...commonSx,
                            zIndex: 1
                        }}
                        animation="wave"
                        variant="rectangular"
                    />
                )
            }
            {
                error && (
                    <Stack
                        justifyContent="center"
                        alignItems="center"
                        component={ButtonBase}
                        onClick={
                            () => {
                                setError(false)
                                showLoading()
                                imageRef.current.src = generate(src)
                            }
                        }
                        sx={{
                            ...commonSx,
                            zIndex: 2
                        }}
                    >
                        <img
                            width={72}
                            height={72}
                            style={{
                                opacity: .75
                            }}
                            src={`${Api.assetSite}/assets/image_fail.png`}
                        />
                        <Typography
                            variant="caption"
                            color="text.disabled"
                        >点击重试</Typography>
                    </Stack>
                )
            }
        </Box>
    )
}

export default memo(ThumbLoader, (prevProps, nextProps) => {
    return prevProps.src === nextProps.src
})