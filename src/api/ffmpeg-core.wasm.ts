import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { createReadStream } from 'fs';

export default async function handler(_req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    res.setHeader('Content-Type', 'application/wasm')
    res.setHeader('Transfer-Encoding', 'chunked')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Cache-Control', 'public, max-age=31536000')
    createReadStream('./wasm/ffmpeg-core.wasm').pipe(res)
}
