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
    const audioContext = useRef<AudioContext>()
    const mediaSource = useRef<MediaElementAudioSourceNode>()
    const analyser = useRef<AnalyserNode>()
    const [byteFrequency, setByteFrequency] = useState<Uint8Array>(new Uint8Array(fftSize))
    const [analysing, setAnalysing] = useState(false)
    const { playing } = useMediaPlayState(audio)
    const ts = useRequestAnimationFrame()

    const startAnalyser = () => {
        const buffer = new Uint8Array(fftSize);
        analyser.current.getByteFrequencyData(buffer);
        setByteFrequency(buffer);
    }

    useEffect(() => {
        if (playing && analysing) {
            startAnalyser()
        }
    }, [ts, playing, analysing])

    const pause = () => {
        if (audioContext.current) {
            setAnalysing(false);
            mediaSource.current.disconnect();
            analyser.current.disconnect();
            audioContext.current.suspend();
        }
    }

    const resume = () => {
        if (!audio) {
            return;
        }
        if (!audioContext.current) {
            audioContext.current = new AudioContext();
            mediaSource.current = audioContext.current.createMediaElementSource(audio);
            analyser.current = audioContext.current.createAnalyser();
        }
        analyser.current.fftSize = fftSize;
        setAnalysing(true);
        mediaSource.current.connect(analyser.current);
        analyser.current.connect(audioContext.current.destination);
        audioContext.current.resume();
    }

    useEffect(() => pause, [])

    return { analysing, pause, resume, byteFrequency }
}

interface AudioVisualProps {
    audio: MutableRefObject<HTMLAudioElement>;
    enabled: boolean;
}

function AudioVisual({ audio, enabled }: AudioVisualProps) {

    const dpr = window.devicePixelRatio;

    const fftSize = 512;
    const barWidth = 4 * dpr;
    const barSpace = 1 * dpr;
    const capHeight = 2;
    const capGap = 2;

    const caps = useRef<number[]>()
    const { byteFrequency, pause, resume } = useAudioContext(audio.current, fftSize)

    const { ref, width: w, height: h } = useResizeObserver()
    const width = w * dpr, height = h * dpr;
    const canvas = useRef<HTMLCanvasElement>()

    const drawCanvas = (buffer: Uint8Array) => {
        const ctx = canvas.current.getContext('2d');
        const gradient = ctx.createLinearGradient(width / 2, 0, width / 2, height);
        gradient.addColorStop(0, '#ff000040');
        gradient.addColorStop(.5, '#ffff0040');
        gradient.addColorStop(1, '#00ffff40');
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = gradient;
        const step = Math.floor(
            (barWidth + barSpace) * fftSize / width
        );
        const steps = Math.floor(fftSize / step);
        if (!caps.current || caps.current && caps.current.length !== steps) {
            caps.current = Array.from({ length: steps }, _ => 0)
        }
        else {
            caps.current = caps.current.map(
                v => v > 0 ? v - 1 : v
            )
        }
        for (let i = 0; i < steps; i++) {
            const intensity = Math.round(
                buffer.slice(i, i + step).reduce(
                    (prev, current) => prev + current,
                    0
                ) / step)
            if (intensity > caps.current[i]) {
                caps.current[i] = intensity;
            }
            const x = i * (barWidth + barSpace) + barSpace / 2;
            ctx.fillRect(x, height - intensity * height / 255, barWidth, intensity * height / 255);
            ctx.fillRect(x, height - caps.current[i] * height / 255 - capHeight - capGap, barWidth, capHeight);
        }
    }

    useEffect(() => {
        if (enabled) {
            resume()
        }
        return () => {
            if (enabled) {
                pause()
            }
        }
    }, [enabled])

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
                    display: 'block',
                    width: '100%',
                    height: '100%'
                }}
            />
        </Box>
    )
}

export default AudioVisual;
