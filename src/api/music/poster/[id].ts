import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { createApiAdaptor, defaultPoster, parseId, getResponse } from '../../../adaptors';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { id: paramId } = req.params;
    const { key, id } = parseId(paramId);
    const adaptor = createApiAdaptor(key)
    const poster = await adaptor.parsePoster(id);
    try {
        if (poster) {
            if (adaptor.posterReferer) {
                const response = await getResponse(poster, {
                    'Referer': adaptor.baseUrl
                });
                const headers = response.headers;
                for (let key of headers.keys()) {
                    res.setHeader(key, headers.get(key))
                }
                response.body.pipe(res);
            }
            else {
                res.writeHead(301, {
                    'location': poster
                })
                res.end()
            }
        }
        else {
            throw new Error('can not find poster')
        }
    }
    catch (err) {
        res.setHeader('Content-Type', 'image/svg+xml')
        res.send(defaultPoster)
    }
}
