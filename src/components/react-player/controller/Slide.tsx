import React, { type CSSProperties, useContext, useMemo } from 'react';
import PlayerContext from '../context';
import { type PlayerContextType } from '../type';

interface SlideProps {
    height?: number;
}

const styles: Record<string, CSSProperties> = {
    wrapper: {
        position: 'relative'
    },
    bar: {
        position: 'absolute',
        height: '100%',
        top: 0,
        left: 0
    },
    played: {
        width: 'calc(100% * var(--played))',
        backgroundImage: 'linear-gradient(to right, hsl(calc(240 * ( 1 - var(--played))), 100%, 50%), hsl(calc(200 * ( 1 - var(--played))), 100%, 50%))'
    },
    buffered: {
        width: 'calc(100% * var(--buffered))',
        backgroundColor: '#999'
    }
}

function Slide({ height = 3 }: SlideProps) {
    const { playState, videoMeta, readyState } = useContext<PlayerContextType>(PlayerContext)
    const { played, buffered } = useMemo<Record<'played' | 'buffered', number>>(() => {
        if (!readyState.metaLoaded) {
            return {
                played: 0,
                buffered: 0
            }
        }
        return {
            played: playState.currentTime / videoMeta.duration,
            buffered: playState.bufferEnd / videoMeta.duration
        }
    }, [readyState, playState, videoMeta])

    return (
        <div
            className="slide"
            style={{
                ...styles.wrapper,
                '--played': played,
                '--buffered': buffered,
                height
            } as CSSProperties}
        >
            <div
                className="buffered"
                style={{
                    ...styles.bar,
                    ...styles.buffered
                }}
            />
            <div
                className="played"
                style={{
                    ...styles.bar,
                    ...styles.played
                }}
            />
        </div>
    )
}

export default Slide;
