import React, { useState, useRef, useEffect } from 'react'
import { Script } from 'gatsby';
import NoSsr from '@mui/material/NoSsr'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import useLocalStorageState from '~/components/hook/useLocalStorageState'

export function Head() {
    return (
        <>
            <title key="qr">二维码生成</title>
        </>
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

    const canvasRef = useRef<HTMLCanvasElement>()
    const [input, setInput] = useLocalStorageState<string>('__qr_cache', '')
    const [libLoaded, setLibLoaded] = useState(false)
    const [done, setDone] = useState(false)

    const generate = () => {
        if (input.data.trim() !== '') {
            QRCode.toCanvas(canvasRef.current, input.data, {
                scale: 8,
                margin: 2,
            }, (error) => {
                if (error) {
                    alert(error)
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
            <Script src="https://unpkg.com/qrcode@1.5.1/build/qrcode.js" onLoad={
                () => setLibLoaded(true)
            } />
            <Stack sx={{
                position: 'relative',
                height: '100%',
                backgroundImage: 'var(--linear-gradient-image)'
            }}>
                <Stack sx={(theme) => ({
                    position: 'absolute',
                    width: '100%',
                    left: '50%',
                    top: done ? 40 : '50%',
                    transform: 'translate(-50%, -50%)',
                    px: 2,
                    transition: theme.transitions.create('top'),
                    color: '#fff',
                    zIndex: 20,
                    [theme.breakpoints.up('sm')]: {
                        width: 450,
                        px: 0
                    }
                })} direction="row" columnGap={1} component="form" onSubmit={
                    (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        generate()
                    }
                }>
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
                    <Button variant="outlined" color="inherit" type="submit">生成</Button>
                </Stack>
                <Stack justifyContent="center" alignItems="center" flexGrow={1}>
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

export default QrcodeGenerator;
