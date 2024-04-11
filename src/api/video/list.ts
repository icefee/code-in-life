import { errorHandler, ApiHandler, proxyJson } from '../../util/middleware'
import { Api } from '../../util/config'

const handler: ApiHandler = (req, res) => {
    return proxyJson(`${Api.site}/api/video/list` + req.url.replace(/^\//, ''), res)
}

export default errorHandler(handler)