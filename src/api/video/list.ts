import { errorHandler, ApiHandler, proxyJson } from '../../util/middleware'
import { Api } from '../../util/config'

const handler: ApiHandler = (req, res) => {
    return proxyJson(Api.site + req.url, res)
}

export default errorHandler(handler)