import { createApiAdaptor, adaptors } from '../../adaptors'
import { errorHandler, ApiHandler, createPayload } from '../../util/middleware'

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
        (prev, current) => current ? [
            ...prev,
            ...current
        ] : prev,
        []
    )
    res.json(
        createPayload(data)
    )
}

export default errorHandler(handler)