import { createApiAdaptor, parseId, Middleware, Env, Proxy, Clue } from '../../../adaptors'

const handler: Middleware.ApiHandler = async (req, res) => {
    const { key, id } = parseId(req.params.token)
    const adaptor = createApiAdaptor(key)
    const url = await adaptor.parseMusicUrl(id)
    if (url) {
        if (Env.isDev) {
            const token = Clue.Base64Params.create(url)
            res.redirect(`/api/music/${token}`)
        }
        else {
            res.redirect(
                url.startsWith('https') ? url : Proxy.proxyUrl(url, true)
            )
        }
    }
    else {
        throw new Error('file not found.')
    }
}

export default Middleware.errorHandler(handler)