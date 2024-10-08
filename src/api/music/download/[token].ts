import { createApiAdaptor, parseId, getResponse, Headers, Middleware } from '../../../adaptors'

const handler: Middleware.ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.token)
    const adaptor = createApiAdaptor(key)
    const url = await adaptor.parseMusicUrl(id)
    const requestHeaders = new Headers()
    if (req.headers['range']) {
        requestHeaders.append('range', req.headers['range'])
    }
    const response = await getResponse(url, {
        headers: requestHeaders
    })
    const headers = response.headers
    const contentType = headers.get('content-type')
    const inheritedHeaders = [
        'content-range'
    ]
    if (/audio\/mpeg|application\/octet-stream/.test(contentType)) {
        for (const key of inheritedHeaders) {
            if (headers.has(key)) {
                res.setHeader(key, headers.get(key))
            }
        }
        response.body.pipe(res)
    }
    else {
        throw new Error('file not found.')
    }
}

export default Middleware.errorHandler(handler)