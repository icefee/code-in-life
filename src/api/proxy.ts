import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { getResponse } from '../adaptors';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { url } = req.query as Record<'url', string>
    const response = await getResponse(url);
    const headers = response.headers;
    const inheritedHeaders = [
        'content-type',
        'transfer-encoding'
    ]
    for (const key of inheritedHeaders) {
        res.setHeader(key, headers.get(key))
    }
    response.body.pipe(res);
}