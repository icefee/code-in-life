import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { parseM3u8File } from 'hls2mp4';
import { getTextWithTimeout } from '../../adaptors';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const searchParams = new URLSearchParams(req.query)
    const url = searchParams.get('url')
    const m3u8 = await parseM3u8File(
        url,
        (url) => getTextWithTimeout(url)
    );
    res.setHeader('Content-Type', 'application/vnd.apple.mpegURL');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Connection', 'keep-alive');
    res.end(
        m3u8.content.replace(/(^|(?<=URI\="))\/?[\w\/]+.(ts|key)/gmi, (v) => new URL(v, m3u8.url).href)
    );
}
