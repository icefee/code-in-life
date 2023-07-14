import { getJson } from '../../adaptors'
import { errorHandler, ApiHandler } from '../../util/middleware'
import { Api } from '../../util/config'
import Clue from '../../util/clue'

const handler: ApiHandler = async (req, res) => {
    const { api, id } = Clue.parse(req.params.id)
    const { type } = req.query
    const url = `${Api.site}/api/video/${api}/${id}`
    const { code, data, msg } = await getJson<ApiJsonType<VideoInfo>>(url)
    if (code !== 0) {
        throw new Error(msg)
    }
    if (type === 'poster') {
        res.redirect(301, data ? data.pic : `/image_fail.jpg`)
    }
    else {
        res.json({
            code: 0,
            data,
            msg: '成功'
        })
    }
}

export default errorHandler(handler)