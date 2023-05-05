import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { createApiAdaptor, defaultPoster, parseId, getResponse } from '../../../adaptors';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { key, id } = parseId(req.params.id);
    const adaptor = createApiAdaptor(key)
    const poster = await adaptor.parsePoster(id);
    try {
        if (poster) {
            if (adaptor.posterReferer) {
                const response = await getResponse(poster, {
                    headers: {
                        'Referer': adaptor.baseUrl
                    }
                });
                const headers = response.headers;
                headers.delete('content-disposition');
                for (const key of headers.keys()) {
                    res.setHeader(key, headers.get(key))
                }
                response.body.pipe(res);
            }
            else {
                res.redirect(poster)
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
