import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
// import { createReadStream } from 'node:fs';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { id, name } = req.query;
    const url = Buffer.from(id, 'base64').toString();
    const response = await fetch(url);
    const headers = response.headers;
    res.setHeader('content-type', headers.get('content-type')!);
    res.setHeader('content-disposition', `attachment; filename* = UTF-8''${encodeURI(name)}.mp3`);
    res.setHeader('content-length', headers.get('content-length'));
    res.setHeader('connection', 'keep-alive');
    response.body.pipe(res);
}
