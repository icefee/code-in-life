import { createApiAdaptor, adaptors, Middleware } from '../../adaptors'

const handler: Middleware.ApiHandler = async (req, res) => {
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
        Middleware.createPayload(data)
    )
}

export default Middleware.errorHandler(handler)