import { createApiAdaptor, parseId, Middleware } from '../../../../adaptors'

const handler: Middleware.ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.id)
    const adaptor = createApiAdaptor(key)
    const lrcText = await adaptor.getLrcText(id)
    if (lrcText) {
        Middleware.appendContentDisposition(req, res, 'lrc')
        res.setHeader('content-type', 'text/lrc')
        res.end(lrcText)
    }
    else {
        throw new Error('lrc file not found.')
    }
}

export default Middleware.errorHandler(handler)