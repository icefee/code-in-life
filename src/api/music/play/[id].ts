import { createApiAdaptor, parseId, getResponse, Middleware, Proxy, Env } from '../../../adaptors'

const handler: Middleware.ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.id)
    const adaptor = createApiAdaptor(key)
    const url = await adaptor.parseMusicUrl(id)
    if (url) {
        if (Env.isDev) {
            const response = await getResponse(url)
            const headers = response.headers
            headers.delete('content-disposition')
            headers.set('content-type', 'audio/mpeg')
            headers.set('accept-ranges', 'bytes')
            for (const key of headers.keys()) {
                res.setHeader(key, headers.get(key))
            }
            response.body.pipe(res)
        }
        else {
            res.redirect(
                url.startsWith('https') ? url : Proxy.proxyUrl(url, true)
            )
        }
    }
    else {
        throw new Error('file not found.')
    }
}

export default Middleware.errorHandler(handler)