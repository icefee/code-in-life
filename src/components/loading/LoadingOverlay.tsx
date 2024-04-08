import React from 'react'
import Stack from '@mui/material/Stack'
import Fade from '@mui/material/Fade'
import Backdrop from '@mui/material/Backdrop'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import Spinner from './Spinner'
import type { Theme, SxProps } from '@mui/material/styles'

type PropsType = {
    open: boolean;
    spinnerSize?: number;
    zIndex?: number;
    fixed?: boolean;
    label?: string;
    labelVariant?: TypographyProps['variant'];
    withoutBackdrop?: boolean;
    withBackground?: boolean;
}

function LoadingOverlay({
    open,
    spinnerSize = 36,
    zIndex,
    fixed = true,
    label,
    labelVariant = 'body1',
    withoutBackdrop = false,
    withBackground = false
}: PropsType) {

    const inner = (
        <>
            <Spinner
                sx={{
                    fontSize: spinnerSize
                }}
            />
            {
                label && (
                    <Typography
                        sx={{
                            textIndent: 8
                        }}
                        variant={labelVariant}
                        color="inherit"
                    >{label}</Typography>
                )
            }
        </>
    )

    const content = withBackground ? (
        <Stack
            sx={{
                p: 1.5,
                backgroundColor: 'rgba(0, 0, 0, .75)',
                borderRadius: 1.5
            }}
            direction="row"
            alignItems="center"
        >
            {inner}
        </Stack>
    ) : inner

    const commonSx: SxProps<Theme> = {
        color: '#fff',
        zIndex: zIndex ?? ((theme) => theme.zIndex.drawer + 1),
        ...(fixed ? null : { position: 'absolute' })
    }

    if (withoutBackdrop) {
        return (
            <Fade in={open} unmountOnExit>
                <Stack
                    sx={{
                        position: 'absolute',
                        inset: 0,
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