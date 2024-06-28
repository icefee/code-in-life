import { createApiAdaptor, parseId } from '../../../adaptors'
import { errorHandler, ApiHandler } from '../../../util/middleware'
import { isDev } from '../../../util/env'
import { proxyUrl } from '../../../util/proxy'
import { Base64Params } from '../../../util/clue'

const handler: ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.token)
    const adaptor = createApiAdaptor(key)
    const url = await adaptor.parseMusicUrl(id)
    if (url) {
        if (isDev) {
            const token = Base64Params.create(url)
            res.redirect(`/api/music/${token}`)
        }
        else {
            res.redirect(
                url.startsWith('https') ? url : proxyUrl(url, true)
            )
        }
    }
    else {
        throw new Error('file not found.')
    }
}

export default errorHandler(handler)