import React from 'react';
import Box from '@mui/material/Box';
import loadable from '@loadable/component'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({
    log: true
})

const VideoPlayer = loadable(() => import('../components/player/VideoPlayer'))

export async function getServerData() {
    return {
        status: 200,
        headers: {
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin'
        },
        props: {}
    }
}

export default function Hls() {

    const runTest = async () => {
        await ffmpeg.load();
        await ffmpeg.run('-bsfs');
        const ts = 'https://cdn1.kaiyunzy.org/20230103/t5SZoT51/1000kb/hls/v7rpQuvK.ts';
        const input = 'input.ts';
        const output = 'output.ts';
        ffmpeg.FS('writeFile', input, await fetchFile(ts))
        await ffmpeg.run(
            '-i',
            input,
            '-map',
            '0',
            '-c',
            'copy',
            '-copy_unknown',
            '-f',
            'mpegts',
            '-bsf:v',
            'remove_extra,h264_mp4toannexb',
            output,
            '-loglevel',
            'debug'
        );
        const buffer = ffmpeg.FS('readFile', output);
        const objectUrl = URL.createObjectURL(new Blob([buffer], { type: 'video/mp2t' }));
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = output;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
        ffmpeg.exit();
    }

    return (
        <Box sx={{
            height: 400
        }}>
            {/* <VideoPlayer
                title="测试m3u8视频"
                url="https://cdn1.kaiyunzy.org/20230103/t5SZoT51/index.m3u8"
                hls
                autoplay
            /> */}
            <button onClick={runTest}>test</button>
        </Box>
    )
}
