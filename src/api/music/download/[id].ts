import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { createApiAdaptor, parseId, getResponse } from '../../../adaptors';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { key, id } = parseId(req.params.id);
    const adaptor = createApiAdaptor(key);
    const url = await adaptor.parseMusicUrl(id);
    const response = await getResponse(url);
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
