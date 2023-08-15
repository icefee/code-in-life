import { createApiAdaptor, parseId, getResponse, Headers } from '../../../adaptors'
import { errorHandler, ApiHandler } from '../../../util/middleware'

const handler: ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.id)
    const adaptor = createApiAdaptor(key)
    const url = await adaptor.parseMusicUrl(id)
    if (url) {
        const requestHeaders = new Headers()
        if (req.headers['range']) {
            requestHeaders.append('range', req.headers['range'])
            res.status(206)
        }
        const response = await getResponse(url, {
            headers: requestHeaders
        })
        const headers = response.headers;
        headers.delete('content-disposition')
        headers.set('content-type', 'audio/mpeg')
        headers.set('accept-ranges', 'bytes')
        for (const key of headers.keys()) {
            res.setHeader(key, headers.get(key))
        }
        response.body.pipe(res)
    }
    else {
        throw new Error('file not found.')
    }
}

export default errorHandler(handler)