import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { getResponse } from '../../adaptors';
import { Api } from '../../util/config';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { url } = req.query as Record<'url', string>
    try {
        const response = await getResponse(`${Api.assetSite}/api/video/parse?url=${url}`)
        res.setHeader('Content-Type', 'application/json')
        response.body.pipe(res)
    }
    catch (err) {
        res.json({
            code: -1,
            msg: String(err)
        })
    }
}
