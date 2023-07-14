import { errorHandler, ApiHandler, proxyJson } from '../../../util/middleware'
import { Api } from '../../../util/config'

const handler: ApiHandler = (req, res) => proxyJson(`${Api.site}/api/video/proxy?${new URLSearchParams(req.query)}`, res)

export default errorHandler(handler)