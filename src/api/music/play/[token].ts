import { createApiAdaptor, parseId } from '../../../adaptors'
import { errorHandler, ApiHandler, createPayload } from '../../../util/middleware'

const handler: ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.token)
    const adaptor = createApiAdaptor(key)
    const url = await adaptor.parseMusicUrl(id)
    if (url) {
        res.json(
            createPayload(url)
        )
    }
    else {
        throw new Error('file not found.')
    }
}

export default errorHandler(handler)