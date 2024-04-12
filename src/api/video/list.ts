import { errorHandler, ApiHandler, proxyJson } from '../../util/middleware'
import { Api } from '../../util/config'

const handler: ApiHandler = (req, res) => {
    const searchParams = new URLSearchParams(req.query)
    return proxyJson(`${Api.site}/api/video/list?${searchParams}`, res)
}

export default errorHandler(handler)