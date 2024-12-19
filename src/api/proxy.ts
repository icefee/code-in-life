import { getResponse, Headers, Middleware } from '../adaptors'

const handler: Middleware.ApiHandler = async (req, res) => {
    const { url } = req.query as Record<'url', string>
    const requestHeaders = new Headers()
    for (let key in req.headers) {
        const values = req.headers[key];
        if (typeof values === 'string') {
            requestHeaders.append(key, values)
        }
        else if (Array.isArray(values)) {
            for (let value of values) {
                requestHeaders.append(key, value)
            }
        }
    }
    const response = await getResponse(url, {
        method: req.method,
        headers: requestHeaders
    })
    const headers = response.headers
    const inheritedHeaders = [
        {
            key: 'content-type',
            defaultValue: 'text/plain'
        },
        {
            key: 'cache-control',
            defaultValue: 'public, max-age=604800'
        },
        {
            key: 'content-range',
            defaultValue: null
        }
    ]
    if (/(video|audio)\/*/.test(headers.get('content-type'))) {
        inheritedHeaders.push({
            key: 'accept-ranges',
            defaultValue: 'bytes'
        })
    }
    if (res.hasHeader('content-length')) {
        inheritedHeaders.push({
            key: 'content-length',
            defaultValue: null
        })
    }
    else {
        inheritedHeaders.push({
            key: 'transfer-encoding',
            defaultValue: 'chunked'
        })
    }
    for (const { key, defaultValue } of inheritedHeaders) {
        const value = headers.get(key) ?? defaultValue
        if (value) {
            res.setHeader(key, value)
        }
    }
    response.body.pipe(res)
}

export default Middleware.errorHandler(handler)