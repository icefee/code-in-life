import { createApiAdaptor, parseId, Middleware } from '../../../adaptors'

const handler: Middleware.ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.token)
    const adaptor = createApiAdaptor(key)
    const lrc = await adaptor.parseLrc(id)
    if (lrc) {
        res.json(
            Middleware.createPayload(lrc)
        )
    }
    else {
        throw new Error('file not found.')
    }
}

export default Middleware.errorHandler(handler)