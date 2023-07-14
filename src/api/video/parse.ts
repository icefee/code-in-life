import { errorHandler, ApiHandler, proxyJson } from '../../util/middleware'
import { Api } from '../../util/config'

const handler: ApiHandler = async (req, res) => proxyJson(`${Api.assetSite}/api/video/parse?${new URLSearchParams(req.query)}`, res)

export default errorHandler(handler)