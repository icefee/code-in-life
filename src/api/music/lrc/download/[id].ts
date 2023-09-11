import { GatsbyFunctionResponse } from 'gatsby'
import { createApiAdaptor, parseId, getResponse } from '../../../../adaptors'
import { appendContentDisposition, errorHandler, ApiHandler } from '../../../../util/middleware'
import { proxyUrl } from '../../../../util/proxy'
import { isDev } from '../../../../util/env'

function setHeader(res: GatsbyFunctionResponse) {
    res.setHeader('content-type', 'text/lrc')
    return res
}

const handler: ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.id)
    const adaptor = createApiAdaptor(key)
    if (adaptor.lrcFile) {
        const url = adaptor.getLrcUrl(id)
        const response = await getResponse(
            isDev ? url : proxyUrl(url, true)
        )
        response.body.pipe(
            setHeader(
                appendContentDisposition(req, res, 'lrc')
            )
        )
    }
    else {
        const lrcText = await adaptor.getLrcText(id)
        if (lrcText) {
            setHeader(
                appendContentDisposition(req, res, 'lrc')
            ).end(lrcText)
        }
        else {
            throw new Error('lrc file not found.')
        }
    }
}

export default errorHandler(handler)