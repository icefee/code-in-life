import { getResponse, Headers, Middleware, Clue } from '../../adaptors'

const handler: Middleware.ApiHandler = async (req, res) => {
    const token = req.params.token
    if (token) {
        const requestHeaders = new Headers()
        const range = req.headers['range']
        if (range) {
            requestHeaders.append('range', Middleware.restrictRange(range))
            res.status(206)
        }
        const url = Clue.Base64Params.parse(token)
        const response = await getResponse(url, {
            headers: requestHeaders
        })
        const headers = response.headers
        if (Middleware.rangeContentIntact(headers.get('content-range'))) {
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
        throw new Error('token can not be null.')
    }
}

export default Middleware.errorHandler(handler)