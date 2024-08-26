import { Middleware, Config } from '../../adaptors'

const handler: Middleware.ApiHandler = (req, res) => {
    const searchParams = new URLSearchParams(req.query)
    return Middleware.proxyJson(`${Config.Api.site}/api/video/list?${searchParams}`, res)
}

export default Middleware.errorHandler(handler)