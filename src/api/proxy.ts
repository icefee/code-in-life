import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { getResponse } from '../adaptors';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { url } = req.query as Record<'url', string>
    const response = await getResponse(url);
    const headers = response.headers;
    const inheritedHeaders = [
        {
            key: 'content-type',
            defaultValue: 'text/plain'
        },
        {
            key: 'transfer-encoding',
            defaultValue: 'chunked'
        }
    ]
    if (/(video|audio)\/*/.test(headers.get('content-type'))) {
        inheritedHeaders.push({
            key: 'accept-ranges',
            defaultValue: 'bytes'
        })
    }
    for (const { key, defaultValue } of inheritedHeaders) {
        res.setHeader(key, headers.get(key) ?? defaultValue)
    }
    response.body.pipe(res);
}