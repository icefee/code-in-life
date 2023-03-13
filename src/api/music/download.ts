import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { setCommonHeaders } from '../../util/pipe';
import { Api } from '../../util/config';
// import { createReadStream } from 'node:fs';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { id, name } = req.query;
    const url = `${Api.music}/api/audition_url?id=${id}`;
    const response = await fetch(url, {
        headers: {
            Referer: Api.music
        }
    });
    const headers = response.headers;
    setCommonHeaders(res);
    res.setHeader('Content-Type', headers.get('Content-Type')!);
    if (name) {
        res.setHeader('Content-Disposition', `attachment; filename* = UTF-8''${encodeURI(name)}.mp3`);
    }
    res.setHeader('Content-Length', headers.get('Content-Length'));
    res.setHeader('Accept-Ranges', headers.get('Accept-Ranges'));
    res.setHeader('Expires', headers.get('Expires'));
    res.setHeader('Cache-Control', headers.get('Cache-Control'));
    res.setHeader('Age', headers.get('Age'));
    res.setHeader('Connection', 'keep-alive');
    response.body.pipe(res);
}
