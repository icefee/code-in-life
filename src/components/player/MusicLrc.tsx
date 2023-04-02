import React, { useState, useEffect, useMemo } from 'react';
import Typography from '@mui/material/Typography';

interface Lrc {
    time: number;
    text: string;
}

interface MusicLrcProps {
    id: number;
    currentTime: number;
}

async function downloadLrc(id: MusicLrcProps['id']): Promise<Lrc[] | null> {
    try {
        const { code, data } = await fetch('/api/music/lrc?id=' + id).then<ApiJsonType<Lrc[]>>(
            response => response.json()
        )
        if (code === 0) {
            return data;
        }
        else {
            throw new Error('download lrc failed.')
        }
    }
    catch (err) {
        return null;
    }
}

function MusicLrc({ id, currentTime }: MusicLrcProps) {

    const [lrc, setLrc] = useState<Lrc[]>([])
    const [downloading, setDownloading] = useState(false)

    const getLrc = async (id: MusicLrcProps['id']) => {
        setDownloading(true)
        const data = await downloadLrc(id)
        if (data) {
            setLrc(data)
        }
        setDownloading(false)
    }

    useEffect(() => {
        getLrc(id)
    }, [id])

    const lrcLine = useMemo(() => {
        if (downloading) {
            return '正在下载歌词..'
        }
        const playedLines = lrc.filter(
            ({ time }) => time <= currentTime
        )
        if (playedLines.length > 0) {
            return playedLines[playedLines.length - 1].text
        }
        return '';
    }, [downloading, lrc, currentTime])
    return (
        <Typography variant="caption" display="block" maxWidth={250} noWrap>{lrcLine}</Typography>
    )
}

export default MusicLrc;
