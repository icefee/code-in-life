import React, { useState, useRef, useEffect } from 'react'
import { Script } from 'gatsby'
import NoSsr from '@mui/material/NoSsr'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import HeadLayout from '~/components/layout/Head'
import useLocalStorageState from '~/components/hook/useLocalStorageState'
import useErrorMessage from '~/components/hook/useErrorMessage'

export function Head() {
    return (
        <HeadLayout>
            <title>二维码生成</title>
        </HeadLayout>
    )
}

interface Option {
    version: number;
    errorCorrectionLevel: string;
    toSJISFunc: (arg: string) => string;
    margin: number;
    scale: number;
    small: boolean;
    width: number;
    color: {
        dark: string;
        light: string;
    }
}

interface QRCodeInstance {
    toCanvas(
        canvas: HTMLCanvasElement,
        text: string,
        options?: Partial<Option>,
        callback?: (err: any) => void
    ): void;
    toCanvas(
        canvas: HTMLCanvasElement,
        text: string,
        callback?: (err: any) => void
    ): void;
}

declare var QRCode: QRCodeInstance;

function QrcodeGenerator() {

    const canvasRef = useRef<HTMLCanvasElement>(null!)
    const [input, setInput] = useLocalStorageState<string>('__qr_cache', '')
    const [libLoaded, setLibLoaded] = useState(false)
    const [done, setDone] = useState(false)

    const { showErrorMessage } = useErrorMessage()

    const generate = () => {
        if (input.data.trim() !== '') {
            QRCode.toCanvas(canvasRef.current, input.data, {
                scale: 8,
                margin: 2,
            }, (error) => {
                if (error) {
                    showErrorMessage({
                        message: error
                    })
                }
                else {
                    setDone(true)
                }
            })
        }
    }

    useEffect(() => {
        if (libLoaded && input.init) {
            generate()
        }
    }, [libLoaded, input])

    return (
        <NoSsr>
            <Script
                src="/scripts/qrcode.js"
                onLoad={
                    () => setLibLoaded(true)
                }
            />
            <Stack
                sx={{
                    position: 'relative',
                    height: '100%',
                    backgroundImage: 'var(--linear-gradient-image)'
                }}
            >
                <Stack
                    sx={({ transitions, breakpoints }) => ({
                        position: 'absolute',
                        width: '100%',
                        left: '50%',
                        top: done ? 40 : '50%',
                        transform: 'translate(-50%, -50%)',
                        px: 2,
                        transition: transitions.create('top'),
                        zIndex: 20,
                        [breakpoints.up('sm')]: {
                            width: 450,
                            px: 0
                        }
                    })}
                    direction="row"
                    columnGap={1}
                    component="form"
                    onSubmit={
                        (event: React.FormEvent<HTMLFormElement>) => {
                            event.preventDefault();
                            generate()
                        }
                    }
                >
                    <TextField
                        sx={{
                            flexGrow: 1
                        }}
                        label="文本"
                        variant="outlined"
                        size="small"
                        value={input.data}
                        onChange={
                            (event: React.ChangeEvent<HTMLTextAreaElement>) => {
                                setInput(
                                    event.target.value
                                )
                            }
                        }
                    />
                    <Button variant="outlined" disabled={!libLoaded} type="submit">生成</Button>
                </Stack>
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    flexGrow={1}
                >
                    <canvas
                        width={250}
                        height={250}
                        ref={canvasRef}
                        style={{
                            opacity: done ? 1 : 0,
                            transition: 'opacity .4s'
                        }}
                    />
                </Stack>
            </Stack>
        </NoSsr>
    )
}

export default QrcodeGenerator