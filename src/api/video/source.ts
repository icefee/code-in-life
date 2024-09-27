import { Middleware, Config, getJson } from '../../adaptors'

type DataSource = {
    key: string;
    rating: number;
    group: 'normal' | '18+'
}

const handler: Middleware.ApiHandler = async (_, res) => {
    const { data } = await getJson<ApiJsonType<DataSource[]>>(`${Config.Api.site}/api/video/source`)
    const keys = []
    const preferKeys = []
    for (const { key, rating, group } of data) {
        const k = `${key}_${rating}`
        if (group === 'normal') {
            keys.push(k)
        }
        else {
            preferKeys.push(k)
        }
    }
    res.json(
        Middleware.createPayload({ keys, preferKeys })
    )
}

export default Middleware.errorHandler(handler)