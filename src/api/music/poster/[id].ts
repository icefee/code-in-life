import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { createApiAdaptor, defaultPoster, parseId, getResponse } from '../../../adaptors';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { key, id } = parseId(req.params.id);
    const adaptor = createApiAdaptor(key);
    const poster = await adaptor.parsePoster(id);
    try {
        if (poster) {
            const response = await getResponse(poster, {
                headers: {
                    'Referer': adaptor.baseUrl
                }
            });
            const headers = response.headers;
            res.setHeader('cache-control', 'public, max-age=604800');
            const inheritedHeaders = [
                'content-type'
            ];
            for (const key of inheritedHeaders) {
                res.setHeader(key, headers.get(key))
            }
            response.body.pipe(res);
        }
        else {
            throw new Error('can not find poster')
        }
    }
    catch (err) {
        res.redirect(defaultPoster)
    }
}
