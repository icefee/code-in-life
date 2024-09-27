import { Middleware, Config, getJson } from '../../adaptors'

type DataSource = {
    key: string;
    rating: number;
    searchDisable?: boolean;
    group: string;
}

const handler: Middleware.ApiHandler = async (_, res) => {
    const { data } = await getJson<ApiJsonType<DataSource[]>>(`${Config.Api.site}/api/video/source`)
    const keys = []
    const preferKeys = []
    for (const { key, rating, group, searchDisable } of data) {
        if (searchDisable) {
            continue
        }
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