import React, { useState, useEffect, useMemo, PropsWithChildren } from 'react'
import Box from '@mui/material/Box'
import { Api } from '~/util/config'

interface BackgroundContainerProps extends PropsWithChildren<{
    prefer?: boolean;
    style?: React.CSSProperties;
}> { }

function BackgroundContainer({
    prefer = false,
    children,
    style
}: BackgroundContainerProps) {

    const [blurDisabled, setBlurDisabled] = useState(false)
    const [image, setImage] = useState('')

    const getRnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min)

    const getNextImage = () => {
        const prefix = Api.assetSite + '/assets';
        return prefer ?
            `${prefix}/background_18_${getRnd(1, 100)}.jpg`
            : `${prefix}/background_${getRnd(1, 28)}.jpg`;
    }

    const absoluteStyle: React.CSSProperties = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
    }

    const backgroundImage = useMemo(() => {
        if (image === '') {
            return 'var(--linear-gradient-image)'
        }
        return `url(${image})`
    }, [image])

    useEffect(() => {
        setImage(
            getNextImage()
        )
    }, [])

    return (
        <Box
            sx={{
                position: 'relative',
                height: '100%',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : 'initial',
                ...style
            }}>
            <Box
                sx={{
                    ...absoluteStyle,
                    opacity: (theme) => theme.palette.mode === 'dark' ? .45 : 'initial',
                    transition: 'background-image 2.5s ease-in-out',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundImage: backgroundImage,
                }}
            />
            <Box
                sx={{
                    ...absoluteStyle,
                    transition: 'all ease .8s',
                    backdropFilter: blurDisabled ? 'none' : 'blur(10px)'
                }}
                onClick={
                    () => setBlurDisabled(
                        blur => !blur
                    )
                }
            />
            {children}
        </Box>
    )
}

export default BackgroundContainer;
