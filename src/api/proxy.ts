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
        }
    ]
    if (/(video|audio)\/*/.test(headers.get('content-type'))) {
        inheritedHeaders.push({
            key: 'accept-ranges',
            defaultValue: 'bytes'
        })
    }
    if (res.hasHeader('content-length')) {
        inheritedHeaders.push({
            key: 'content-length',
            defaultValue: null
        })
    }
    else {
        inheritedHeaders.push({
            key: 'transfer-encoding',
            defaultValue: 'chunked'
        })
    }
    for (const { key, defaultValue } of inheritedHeaders) {
        const value = headers.get(key) ?? defaultValue;
        if (value) {
            res.setHeader(key, value);
        }
    }
    response.body.pipe(res);
}