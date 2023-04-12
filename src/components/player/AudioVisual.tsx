import React, { useState, useEffect, useRef, MutableRefObject } from 'react';
import Box from '@mui/material/Box';
import useResizeObserver from '../hook/useResizeObserver';

function useMediaPlayState(media: HTMLMediaElement | null) {
    const [playing, setPlaying] = useState(false)
    const onPlay = () => {
        setPlaying(true)
    }
    const onPause = () => {
        setPlaying(false)
    }
    useEffect(() => {
        if (media) {
            media.addEventListener('play', onPlay)
            media.addEventListener('pause', onPause)
        }
        return () => {
            if (media) {
                media.removeEventListener('play', onPlay)
                media.removeEventListener('pause', onPause)
            }
        }
    }, [media])
    return { playing }
}

function useRequestAnimationFrame() {
    const raf = useRef<number>()
    const [ts, setTs] = useState(0)
    const loop = () => {
        setTs(+new Date)
        raf.current = requestAnimationFrame(loop)
    }
    const cancelLoop = () => {
        cancelAnimationFrame(raf.current)
    }
    useEffect(() => {
        loop()
        return cancelLoop;
    }, [])
    return ts;
}

function useAudioContext(audio: HTMLAudioElement | null, fftSize = 2048) {
    const { playing } = useMediaPlayState(audio)
    const audioContext = useRef<AudioContext>()
    const mediaSource = useRef<MediaElementAudioSourceNode>()
    const analyser = useRef<AnalyserNode>()
    const [byteFrequency, setByteFrequency] = useState<Uint8Array>(new Uint8Array(fftSize))
    const ts = useRequestAnimationFrame()

    const startAnalyser = () => {
        const buffer = new Uint8Array(fftSize);
        analyser.current.getByteFrequencyData(buffer);
        setByteFrequency(buffer);
    }

    useEffect(() => {
        if (playing) {
            startAnalyser()
        }
    }, [ts, playing])

    useEffect(() => {
        if (!audio) {
            return;
        }
        if (!audioContext.current) {
            audioContext.current = new AudioContext();
            mediaSource.current = audioContext.current.createMediaElementSource(audio);
            analyser.current = audioContext.current.createAnalyser();
        }
        analyser.current.fftSize = fftSize;
        mediaSource.current.connect(analyser.current);
        analyser.current.connect(audioContext.current.destination);
        audioContext.current.resume();
        startAnalyser();
        return () => {
            audioContext.current.suspend();
            mediaSource.current.disconnect();
            analyser.current.disconnect();
        }
    }, [audio, playing, fftSize])

    return { byteFrequency }
}

interface AudioVisualProps {
    audio: MutableRefObject<HTMLAudioElement>;
}

function AudioVisual({ audio }: AudioVisualProps) {

    const fftSize = 512;
    const barWidth = 4;
    const barSpace = 1;

    const { byteFrequency } = useAudioContext(audio.current, fftSize)

    const { ref, width, height } = useResizeObserver()
    const canvas = useRef<HTMLCanvasElement>()

    const drawCanvas = (buffer: Uint8Array) => {
        const ctx = canvas.current.getContext('2d');
        const gradient = ctx.createLinearGradient(width / 2, 0, width / 2, height);
        gradient.addColorStop(0, '#ff000040');
        gradient.addColorStop(1, '#00ffff40');
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = gradient;
        const steps = Math.floor(
            (barWidth + barSpace) * fftSize / width
        )
        for (let i = 0; i < buffer.length; i++) {
            const intensity = Math.round(
                buffer.slice(i, i + steps).reduce(
                    (prev, current) => prev + current,
                    0
                ) / steps)
            ctx.fillRect(i * (barWidth + barSpace) + barSpace / 2, height - intensity * height / 255, barWidth, intensity * height / 255);
        }
    }

    useEffect(() => {
        drawCanvas(byteFrequency)
    }, [width, height, byteFrequency])

    return (
        <Box sx={{
            width: '100%',
            height: '100%'
        }} ref={ref}>
            <canvas
                width={width}
                height={height}
                ref={canvas}
                style={{
                    display: 'block'
                }}
            />
        </Box>
    )
}

export default AudioVisual;
