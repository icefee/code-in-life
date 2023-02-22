import React, { useMemo } from 'react';
import Typography from '@mui/material/Typography';

export interface Lrc {
    time: number;
    text: string;
}

interface MusicLrcProps {
    currentTime: number;
    lrc: Lrc[];
}

function MusicLrc({ lrc, currentTime }: MusicLrcProps) {
    const lrcLine = useMemo(() => {
        const playedLines = lrc.filter(
            ({ time }) => time <= currentTime
        )
        if (playedLines.length > 0) {
            return playedLines[playedLines.length - 1].text
        }
        return '';
    }, [lrc, currentTime])
    return (
        <Typography variant="caption">{lrcLine}</Typography>
    )
}

export default MusicLrc;
