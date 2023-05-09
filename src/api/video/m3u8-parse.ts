import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { parseM3u8File } from 'hls2mp4';
import { getTextWithTimeout } from '../../adaptors';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const searchParams = new URLSearchParams(req.query)
    const id = searchParams.get('id')
    const m3u8 = await parseM3u8File(
        Buffer.from(`${id}=`, 'base64').toString('utf-8'),
        (url) => getTextWithTimeout(url)
    );
    res.setHeader('Content-Type', 'application/vnd.apple.mpegURL');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Connection', 'keep-alive');
    res.end(
        m3u8.content.replace(/^\/?\w+.ts/gmi, (v) => new URL(v, m3u8.url).href)
    );
}
