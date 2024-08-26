import { createApiAdaptor, parseId, Middleware } from '../../../adaptors'

const handler: Middleware.ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.id)
    const adaptor = createApiAdaptor(key)
    const data = await adaptor.parseLrc(id)
    if (data) {
        res.json(
            Middleware.createPayload(data)
        )
    }
    else {
        throw new Error('lrc not found.')
    }
}

export default Middleware.errorHandler(handler)