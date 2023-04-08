import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { Api } from '../../../../util/config';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { id } = req.params;
    const { name } = req.query;
    const response = await fetch(`${Api.music}/download/lrc/${id}`);
    const headers = response.headers;
    if (name) {
        res.setHeader('Content-Disposition', `attachment; filename* = UTF-8''${name}.lrc`);
    }
    res.setHeader('Content-Type', headers.get('Content-Type'));
    res.setHeader('Content-Length', headers.get('Content-Length'));
    res.setHeader('Accept-Ranges', headers.get('Accept-Ranges'));
    res.setHeader('Expires', headers.get('Expires'));
    res.setHeader('Cache-Control', headers.get('Cache-Control'));
    res.setHeader('Age', headers.get('Age'));
    res.setHeader('Connection', 'keep-alive');
    response.body.pipe(res);
}
