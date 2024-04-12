import React from 'react'
import Stack from '@mui/material/Stack'
import Fade from '@mui/material/Fade'
import Backdrop from '@mui/material/Backdrop'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import Spinner from './Spinner'
import type { SxProps, Theme } from '@mui/material/styles'

type PropsType = {
    open: boolean;
    spinSize?: number;
    zIndex?: number;
    fixed?: boolean;
    label?: string;
    labelVariant?: TypographyProps['variant'];
    labelColor?: string;
    withoutBackdrop?: boolean;
    withBackground?: boolean;
}

function LoadingOverlay({
    open,
    spinSize = 32,
    zIndex,
    fixed = true,
    label,
    labelVariant = 'body1',
    labelColor,
    withoutBackdrop = false,
    withBackground = false
}: PropsType) {

    const inner = (
        <>
            <Spinner
                sx={{
                    fontSize: spinSize
                }}
            />
            {
                label && (
                    <Typography
                        sx={{
                            ml: 1
                        }}
                        variant={labelVariant}
                        color="inherit"
                    >{label}</Typography>
                )
            }
        </>
    )

    const content = withBackground ? (
        <Stack sx={{
            p: ({ spacing }) => spacing(1, 1.5),
            bgcolor: 'rgba(0, 0, 0, .75)',
            borderRadius: 1.5,
            maxWidth: '80%'
        }}
            direction="row"
            alignItems="center"
        >
            {inner}
        </Stack>
    ) : inner

    const commonSx: SxProps<Theme> = {
        color: labelColor,
        zIndex: zIndex ?? ((theme) => theme.zIndex.drawer + 1),
        ...(fixed ? null : { position: 'absolute' })
    }

    if (withoutBackdrop) {
        return (
            <Fade in={open} unmountOnExit>
                <Stack
                    sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        ...commonSx
                    }}
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                >
                    {content}
                </Stack>
            </Fade>
        )
    }

    return (
        <Backdrop
            sx={commonSx}
            open={open}
            unmountOnExit
        >{content}</Backdrop>
    )
}

export default LoadingOverlay