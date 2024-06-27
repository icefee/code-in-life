import { createApiAdaptor, parseId, getResponse, Headers } from '../../../adaptors'
import { errorHandler, ApiHandler, restrictRange, rangeContentIntact } from '../../../util/middleware'

const handler: ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.token)
    const adaptor = createApiAdaptor(key)
    const url = await adaptor.parseMusicUrl(id)
    if (url) {
        const requestHeaders = new Headers()
        const range = req.headers['range']
        if (range) {
            requestHeaders.append('range', restrictRange(range))
            res.status(206)
        }
        const response = await getResponse(url, {
            headers: requestHeaders
        })
        const headers = response.headers
        if (rangeContentIntact(headers.get('content-range'))) {
            res.status(200)
        }
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