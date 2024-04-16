import { createApiAdaptor, adaptors } from '../../adaptors'
import { errorHandler, ApiHandler } from '../../util/middleware'

const handler: ApiHandler = async (req, res) => {
    const { s } = req.query
    const result = await Promise.all(
        adaptors.map(
            (k) => {
                const adaptor = createApiAdaptor(k)
                return adaptor.getMusicSearch(s)
            }
        )
    )
    const data = result.reduce(
        (prev, current) => [
            ...prev,
            ...current
        ],
        []
    )
    res.json({
        code: 0,
        data,
        msg: '成功'
    })
}

export default errorHandler(handler)