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
        res.setHeader('Content-Type', headers.get('Content-Type'));
        const { name } = req.query;
        if (name) {
            res.setHeader('Content-Disposition', `attachment; filename* = UTF-8''${name}.mp3`);
        }
        res.setHeader('Content-Length', headers.get('Content-Length'));
        res.setHeader('Accept-Ranges', headers.get('Accept-Ranges'));
        res.setHeader('Expires', headers.get('Expires'));
        res.setHeader('Cache-Control', headers.get('Cache-Control'));
        res.setHeader('Age', headers.get('Age'));
        res.setHeader('Connection', 'keep-alive');
        response.body.pipe(res);
    }
}
