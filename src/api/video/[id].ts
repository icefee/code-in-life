import { getJson } from '../../adaptors'
import { errorHandler, ApiHandler } from '../../util/middleware'
import { Api } from '../../util/config'
import Clue from '../../util/clue'
import { proxyUrl } from '../../util/proxy'

async function getRelatedList(api: string, typeId: number) {
    const searchParams = new URLSearchParams({
        api,
        t: String(typeId)
    })
    const { data } = await getJson<ApiJsonType<{
        video?: VideoListItem[];
    }>>(`${Api.site}/api/video/list?${searchParams}`)
    return data?.video ?? []
}

const handler: ApiHandler = async (req, res) => {
    const { api, id } = Clue.parse(req.params.id)
    const { type, proxy } = req.query
    const url = `${Api.site}/api/video/${api}/${id}`
    const { code, data, msg } = await getJson<ApiJsonType<VideoInfo>>(url)
    if (code !== 0) {
        throw new Error(msg)
    }
    if (type === 'poster') {
        res.redirect(301, data ? proxy === '1' ? proxyUrl(data.pic) : data.pic : `/image_fail.jpg`)
    }
    else {
        const related = await getRelatedList(api, data.tid)
        data.related = related.filter(
            ({ id }) => id !== data.id
        ).map(
            ({ id, ...rest }) => ({
                id: Clue.create(api, id),
                ...rest
            })
        )
        res.json({
            code: 0,
            data,
            msg: '成功'
        })
    }
}

export default errorHandler(handler)