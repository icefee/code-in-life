import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby'
import { getResponse } from '../../../adaptors'
import { Api } from '../../../util/config'
import { appendContentDisposition } from '../../../util/middleware'

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    try {
        const response = await getResponse(`${Api.hosting}/api/music/play/${req.params.id}`)
        const headers = response.headers
        const contentType = headers.get('Content-Type')
        if (!/audio\/mpeg/.test(contentType)) {
            throw new Error('file not found.')
        }
        else {
            for (const key of headers.keys()) {
                res.setHeader(key, headers.get(key))
            }
            response.body.pipe(appendContentDisposition(req, res, 'mp3'))
        }
    }
    catch (err) {
        res.json({
            code: -1,
            data: null,
            msg: err
        })
    }
}
