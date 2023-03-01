import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { setCommonHeaders } from '../../util/pipe';
import { Api } from '../../util/config';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { url } = req.query as Record<'url', string>
    const response = await fetch(`${Api.site}/api/video/parse?url=${url}`)
    setCommonHeaders(res)
    res.setHeader('Content-Type', 'application/json')
    response.body.pipe(res)
}
