import { createApiAdaptor, parseId } from '../../../adaptors'
import { errorHandler, ApiHandler } from '../../../util/middleware'

const handler: ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.id)
    const adaptor = createApiAdaptor(key)
    const lrc = await adaptor.parseLrc(id)
    if (lrc) {
        res.json({
            code: 0,
            data: lrc,
            msg: '成功'
        })
    }
    else {
        throw new Error('lrc not found.')
    }
}

export default errorHandler(handler)