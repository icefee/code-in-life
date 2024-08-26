import { createApiAdaptor, defaultPoster, parseId, getResponse, Middleware } from '../../../adaptors'

const handler: Middleware.ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.id)
    const adaptor = createApiAdaptor(key)
    const poster = await adaptor.parsePoster(id)
    if (poster) {
        const response = await getResponse(poster, {
            headers: {
                'referer': adaptor.baseUrl
            }
        })
        const headers = response.headers
        res.setHeader('cache-control', 'public, max-age=604800')
        const inheritedHeaders = [
            'content-type'
        ]
        for (const key of inheritedHeaders) {
            res.setHeader(key, headers.get(key))
        }
        response.body.pipe(res)
    }
    else {
        res.redirect(defaultPoster)
    }
}

export default Middleware.errorHandler(handler)