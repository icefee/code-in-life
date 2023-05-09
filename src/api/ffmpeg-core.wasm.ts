import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { getResponse } from '../adaptors';

export default async function handler(_req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const wasmUrl = 'https://unpkg.com/@ffmpeg/core-st@0.11.1/dist/ffmpeg-core.wasm';
    const response = await getResponse(wasmUrl);
    res.setHeader('Content-Type', 'application/wasm')
    res.setHeader('Transfer-Encoding', 'chunked')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Cache-Control', 'public, max-age=31536000')
    response.body.pipe(res)
}
