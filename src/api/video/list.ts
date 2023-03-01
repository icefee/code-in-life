import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { Api } from '../../util/config';
import { setCommonHeaders } from '../../util/pipe';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { s = '' } = req.query;
    const searchParams = new URLSearchParams()
    if (s.startsWith('$')) {
        searchParams.set('s', s.slice(1))
        searchParams.set('prefer', '18')
    }
    else {
        searchParams.set('s', s)
    }
    const response = await fetch(`${Api.site}/api/video/list?${searchParams.toString()}`)
    setCommonHeaders(res)
    res.setHeader('Content-Type', 'application/json')
    response.body.pipe(res)
}
