import { createApiAdaptor, parseId, getResponse } from '../../../adaptors'
import { appendContentDisposition, errorHandler, ApiHandler } from '../../../util/middleware'

const handler: ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.id)
    const adaptor = createApiAdaptor(key)
    const url = await adaptor.parseMusicUrl(id)
    const response = await getResponse(url)
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

export default errorHandler(handler)