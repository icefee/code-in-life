import { createApiAdaptor, defaultPoster, parseId, getResponse, Middleware } from '../../../adaptors'
import { userAgent } from '../../../util/config'

const handler: Middleware.ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.token)
    const adaptor = createApiAdaptor(key)
    const poster = await adaptor.parsePoster(id)
    if (poster) {
        const headers = {
            'user-agent': userAgent
        }
        if (key !== 'g') {
            headers['referer'] = adaptor.baseUrl
        }
        const response = await getResponse(poster, {
            headers
        })
        res.setHeader('cache-control', 'public, max-age=604800')
        const inheritedHeaders = [
            'content-type'
        ]
        for (const key of inheritedHeaders) {
            res.setHeader(key, response.headers.get(key))
        }
        response.body.pipe(res)
    }
    else {
        res.redirect(defaultPoster)
    }
}

export default Middleware.errorHandler(handler)