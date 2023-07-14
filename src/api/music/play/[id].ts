import { createApiAdaptor, parseId, getResponse } from '../../../adaptors'
import { errorHandler, ApiHandler } from '../../../util/middleware'
import { isDev } from '../../../util/env'

const handler: ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.id)
    const adaptor = createApiAdaptor(key)
    const url = await adaptor.parseMusicUrl(id)
    if (url) {
        if (isDev) {
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
            res.redirect(url)
        }
    }
    else {
        throw new Error('file not found.')
    }
}

export default errorHandler(handler)