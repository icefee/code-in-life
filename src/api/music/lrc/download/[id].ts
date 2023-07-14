import { createApiAdaptor, parseId, getResponse } from '../../../../adaptors'
import { appendContentDisposition, errorHandler, ApiHandler } from '../../../../util/middleware'

const handler: ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.id)
    res.json({
        key,
        id
    })
    // const adaptor = createApiAdaptor(key)
    // if (adaptor.lrcFile) {
    //     const response = await getResponse(adaptor.getLrcUrl(id))
    //     const headers = response.headers
    //     for (const key of headers.keys()) {
    //         res.setHeader(key, headers.get(key))
    //     }
    //     response.body.pipe(appendContentDisposition(req, res, 'lrc'))
    // }
    // else {
    //     const lrcText = await adaptor.getLrcText(id)
    //     if (lrcText) {
    //         appendContentDisposition(req, res, 'lrc').setHeader('Content-Type', 'text/lrc').send(lrcText)
    //     }
    //     else {
    //         throw new Error('lrc file not found.')
    //     }
    // }
}

export default errorHandler(handler)