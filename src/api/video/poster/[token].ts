import { getJson } from '../../../adaptors'
import { errorHandler, ApiHandler } from '../../../util/middleware'
import { Api } from '../../../util/config'
import { proxyUrl } from '../../../util/proxy'
import { Clue } from '../../../util/clue'
import { isDev } from '../../../util/env'

const handler: ApiHandler = async (req, res) => {
    const { api, id } = Clue.parse(req.params.token)
    const url = `${Api.site}/api/video/${api}/${id}`
    const { code, data, msg } = await getJson<ApiJsonType<VideoInfo>>(url)
    if (code === 0) {
        res.redirect(301, data ? data.proxy ? proxyUrl(data.pic, isDev) : data.pic : `/image_fail.jpg`)
    }
    else {
        throw new Error(msg)
    }
}

export default errorHandler(handler)