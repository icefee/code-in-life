import { GatsbyFunctionResponse } from 'gatsby'
import { createApiAdaptor, parseId } from '../../../../adaptors'
import { appendContentDisposition, errorHandler, ApiHandler } from '../../../../util/middleware'

function setHeader(res: GatsbyFunctionResponse) {
    res.setHeader('content-type', 'text/lrc')
    return res
}

const handler: ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.id)
    const adaptor = createApiAdaptor(key)
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

export default errorHandler(handler)