import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { createApiAdaptor, parseId, getResponse } from '../../../adaptors';
import { isDev } from '../../../util/env';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { key, id } = parseId(req.params.id);
    const adaptor = createApiAdaptor(key);
    const url = await adaptor.parseMusicUrl(id);
    console.log(url);
    if (url) {
        if (isDev) {
            const response = await getResponse(url);
            const headers = response.headers;
            headers.delete('content-disposition');
            headers.set('content-type', 'audio/mpeg');
            for (const key of headers.keys()) {
                res.setHeader(key, headers.get(key))
            }
            response.body.pipe(res);
        }
        else {
            res.writeHead(301, {
                location: url
            })
            res.end()
        }
    }
    else {
        res.json({
            code: -1,
            data: null,
            msg: '失败'
        })
    }
}