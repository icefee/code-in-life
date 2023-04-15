import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { Api } from '../../../../util/config';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { id } = req.params;
    const { name } = req.query;
    const response = await fetch(`${Api.music}/download/lrc/${id}`);
    const headers = response.headers;
    if (name) {
        headers.set('Content-Disposition', `attachment; filename* = UTF-8''${encodeURIComponent(name)}.lrc`);
    }
    for (let key of headers.keys()) {
        res.setHeader(key, headers.get(key))
    }
    response.body.pipe(res);
}
