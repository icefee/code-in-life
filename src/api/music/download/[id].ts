import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { Api } from '../../../util/config';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { id } = req.params;
    const response = await fetch(`${Api.hosting}/api/music/play/${id}`);
    const headers = response.headers;
    const contentType = headers.get('Content-Type');
    if (contentType === 'text/html') {
        res.status(200).json({
            code: -1,
            err: '文件不存在, 无法下载'
        })
    }
    else {
        const { name } = req.query;
        if (name) {
            headers.set('Content-Disposition', `attachment; filename* = UTF-8''${name}.mp3`)
        }
        for (let key of headers.keys()) {
            res.setHeader(key, headers.get(key))
        }
        response.body.pipe(res);
    }
}
