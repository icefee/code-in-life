import React, { useEffect, useRef, MutableRefObject } from 'react';
import Box from '@mui/material/Box';

interface AudioVisualProps {
    audio: MutableRefObject<HTMLAudioElement>;
}

function AudioVisual({ audio }: AudioVisualProps) {

    const raf = useRef<number>()
    const audioContext = useRef<AudioContext>()
    const analyser = useRef<AnalyserNode>()
    const fftSize = 512;
    const mediaSource = useRef<MediaElementAudioSourceNode>()
    const buffer = useRef<Uint8Array>(null)

    const drawVisual = () => {
        buffer.current = new Uint8Array(fftSize);
        analyser.current.getByteFrequencyData(buffer.current);
        console.log(buffer.current);
        raf.current = requestAnimationFrame(drawVisual);
    }

    const onPlay = async () => {
        if (!audioContext.current) {
            audioContext.current = new AudioContext();
            mediaSource.current = audioContext.current.createMediaElementSource(audio.current);
        }
        analyser.current = audioContext.current.createAnalyser();
        analyser.current.fftSize = fftSize;
        mediaSource.current.connect(analyser.current);
        analyser.current.connect(audioContext.current.destination);
        audioContext.current.resume();
        drawVisual()
    }

    const onPause = async () => {
        cancelAnimationFrame(raf.current);
        await audioContext.current.suspend();
        mediaSource.current.disconnect();
        analyser.current.disconnect();
    }

    useEffect(() => {
        if (audio.current) {
            audio.current.addEventListener('play', onPlay)
            audio.current.addEventListener('pause', onPause)
        }
        return () => {
            if (audio.current) {
                audio.current.removeEventListener('play', onPlay)
                audio.current.removeEventListener('pause', onPause)
            }
        }
    }, [audio])

    return (
        <Box sx={{
            width: '100%',
            height: '100%'
        }}>
            <canvas />
        </Box>
    )
}

export default AudioVisual;
