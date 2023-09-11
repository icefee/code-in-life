import { createApiAdaptor, parseId, getResponse } from '../../../../adaptors'
import { appendContentDisposition, errorHandler, ApiHandler } from '../../../../util/middleware'
import { proxyUrl } from '../../../../util/proxy'
import { isDev } from '../../../../util/env'

const handler: ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.id)
    const adaptor = createApiAdaptor(key)
    if (adaptor.lrcFile) {
        const url = adaptor.getLrcUrl(id)
        const response = await getResponse(
            isDev ? url : proxyUrl(url, true)
        )
        const headers = response.headers
        for (const key of headers.keys()) {
            res.setHeader(key, headers.get(key))
        }
        response.body.pipe(appendContentDisposition(req, res, 'lrc'))
    }
    else {
        const lrcText = await adaptor.getLrcText(id)
        if (lrcText) {
            appendContentDisposition(req, res, 'lrc').setHeader('Content-Type', 'text/lrc').send(lrcText)
        }
        else {
            throw new Error('lrc file not found.')
        }
    }
}

export default errorHandler(handler)