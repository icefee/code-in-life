import { createApiAdaptor, defaultPoster, parseId, getResponse } from '../../../adaptors'
import { errorHandler, ApiHandler } from '../../../util/middleware'

const handler: ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.token)
    const adaptor = createApiAdaptor(key)
    const poster = await adaptor.parsePoster(id)
    if (poster) {
        const response = await getResponse(poster, {
            headers: {
                'referer': adaptor.baseUrl
            }
        });
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

export default errorHandler(handler)