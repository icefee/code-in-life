import { getJson, Middleware, Proxy, Clue, Config } from '../../../adaptors'

const handler: Middleware.ApiHandler = async (req, res) => {
    const { api, id } = Clue.VideoParams.parse(req.params.token)
    const url = `${Config.Api.site}/api/video/${api}/${id}`
    const { code, data, msg } = await getJson<ApiJsonType<VideoInfo>>(url)
    if (code === 0) {
        res.redirect(301, Proxy.proxyUrl(data.pic, true))
    }
    else {
        throw new Error(msg)
    }
}

export default Middleware.errorHandler(handler)