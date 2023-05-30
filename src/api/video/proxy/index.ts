import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { getResponse } from '../../../adaptors';
import { Api } from '../../../util/config';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const searchParams = new URLSearchParams(req.query as Record<string, string>)
    try {
        const response = await getResponse(`${Api.site}/api/video/proxy?${searchParams}`)
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
