import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { getResponse } from '../../../adaptors';
import { Api } from '../../../util/config';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const response = await getResponse(`${Api.hosting}/api/music/play/${req.params.id}`);
    const headers = response.headers;
    const contentType = headers.get('Content-Type');
    if (contentType.match(/text\/html/)) {
        res.status(200).json({
            code: -1,
            data: null,
            msg: 'file not found.'
        })
    }
    else {
        const { name } = req.query;
        if (name) {
            headers.set('Content-Disposition', `attachment; filename* = UTF-8''${encodeURIComponent(name)}.mp3`)
        }
        for (const key of headers.keys()) {
            res.setHeader(key, headers.get(key))
        }
        response.body.pipe(res);
    }
}
