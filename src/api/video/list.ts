import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { Api } from '../../util/config';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const searchParams = new URLSearchParams(req.query)
    try {
        const response = await fetch(`${Api.site}/api/video/list?${searchParams}`)
        res.setHeader('Content-Type', 'application/json')
        response.body.pipe(res)
    }
    catch (err) {
        res.json({
            code: -1,
            data: null,
            msg: String(err)
        })
    }
}
