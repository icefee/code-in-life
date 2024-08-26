import { getJson, Middleware, Config, Clue } from '../../adaptors'

async function getRelatedList(api: string, typeId: number) {
    const searchParams = new URLSearchParams({
        api,
        t: String(typeId)
    })
    const { data } = await getJson<ApiJsonType<{
        video?: VideoListItem[];
    }>>(`${Config.Api.site}/api/video/list?${searchParams}`)
    return data?.video ?? []
}

const handler: Middleware.ApiHandler = async (req, res) => {
    const { api, id } = Clue.VideoParams.parse(req.params.token)
    const url = `${Config.Api.site}/api/video/${api}/${id}`
    const { code, data, msg } = await getJson<ApiJsonType<VideoInfo>>(url)
    if (code === 0) {
        const related = await getRelatedList(api, data.tid)
        data.related = related.filter(
            ({ id }) => id !== data.id
        ).map(
            ({ id, ...rest }) => ({
                id: Clue.VideoParams.create(api, id),
                ...rest
            })
        )
        res.json(
            Middleware.createPayload(data)
        )
    }
    else {
        throw new Error(msg)
    }
}

export default Middleware.errorHandler(handler)