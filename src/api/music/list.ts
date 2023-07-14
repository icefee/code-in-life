import { createApiAdaptor, adaptors } from '../../adaptors'
import { errorHandler, ApiHandler } from '../../util/middleware'

const handler: ApiHandler = async (req, res) => {
    const { s } = req.query
    const list: SearchMusic[] = []
    for (const k of adaptors) {
        const adaptor = createApiAdaptor(k)
        const result = await adaptor.getMusicSearch(s)
        if (result) {
            list.push(...result)
        }
    }
    res.json({
        code: 0,
        data: list,
        msg: '成功'
    })
}

errorHandler(handler)