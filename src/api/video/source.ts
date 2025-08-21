import { Middleware, Config, getJson } from '../../adaptors'

const handler: Middleware.ApiHandler = async (_, res) => {
    const { data } = await getJson<ApiJsonType<DataSource[]>>(`${Config.Api.site}/api/video/source`)
    const normal = []
    const prefer = []
    for (const { key, name, rating, group } of data) {
        const source = {
            key,
            name,
            rating
        }
        if (group === 'normal') {
            normal.push(source)
        }
        else {
            prefer.push(source)
        }
    }
    res.json(
        Middleware.createPayload({ normal, prefer })
    )
}

export default Middleware.errorHandler(handler)