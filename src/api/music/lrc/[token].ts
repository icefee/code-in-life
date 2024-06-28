import { createApiAdaptor, parseId } from '../../../adaptors'
import { errorHandler, ApiHandler, createPayload } from '../../../util/middleware'

const handler: ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.token)
    const adaptor = createApiAdaptor(key)
    const lrc = await adaptor.parseLrc(id)
    if (lrc) {
        res.json(
            createPayload(lrc)
        )
    }
    else {
        throw new Error('file not found.')
    }
}

export default errorHandler(handler)