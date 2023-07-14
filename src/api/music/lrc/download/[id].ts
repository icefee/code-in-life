import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby'
import { createApiAdaptor, parseId, getResponse } from '../../../../adaptors'
import { appendContentDisposition } from '../../../../util/middleware'

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { key, id } = parseId(req.params.id)
    const adaptor = createApiAdaptor(key)
    try {
        if (adaptor.lrcFile) {
            const response = await getResponse(adaptor.getLrcUrl(id))
            const headers = response.headers
            for (const key of headers.keys()) {
                res.setHeader(key, headers.get(key))
            }
            response.body.pipe(appendContentDisposition(req, res, 'lrc'))
        }
        else {
            const lrcText = await adaptor.getLrcText(id)
            if (lrcText) {
                appendContentDisposition(req, res, 'lrc').setHeader('content-type', 'text/lrc').send(lrcText)
            }
            else {
                throw new Error('lrc file not found.')
            }
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
