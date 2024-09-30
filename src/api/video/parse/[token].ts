import { getTextWithTimeout, Middleware, Proxy, Clue } from '../../../adaptors'

async function parseVideoUrl(url: string) {
    try {
        const html = await getTextWithTimeout(
            Proxy.proxyUrl(url, true)
        )
        const matches = html.match(
            new RegExp('(https?://)?[\\w\\u4e00-\\u9fa5-./@%?:]+?\\.(m3u8|webm|mp4)', 'i')
        )
        if (matches) {
            return Proxy.parseUrl(matches.at(0), url)
        }
        else {
            throw new Error('😥 no match found.')
        }
    }
    catch (err) {
        return null
    }
}

const handler: Middleware.ApiHandler = async (req, res) => {
    const { token } = req.params
    const url = Clue.Base64Params.parse(token)
    const data = await parseVideoUrl(url)
    res.json(data ? Middleware.createPayload(data) : Middleware.createErrorPayload())
}

export default Middleware.errorHandler(handler)