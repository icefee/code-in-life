import { getJson } from '../../../adaptors'
import { errorHandler, ApiHandler } from '../../../util/middleware'
import { Api } from '../../../util/config'
import { proxyUrl } from '../../../util/proxy'
import { Clue } from '../../../util/clue'

const handler: ApiHandler = async (req, res) => {
    const { api, id } = Clue.parse(req.params.token)
    const url = `${Api.site}/api/video/${api}/${id}`
    const { code, data, msg } = await getJson<ApiJsonType<VideoInfo>>(url)
    if (code === 0) {
        res.redirect(301, proxyUrl(data.pic, true))
    }
    else {
        throw new Error(msg)
    }
}

export default errorHandler(handler)