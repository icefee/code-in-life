import { getTextWithTimeout } from '../../../adaptors'
import { errorHandler, ApiHandler, createPayload, createErrorPayload } from '../../../util/middleware'
import { proxyUrl, parseUrl } from '../../../util/proxy'
import { Base64Params } from '../../../util/clue'

async function parseVideoUrl(url: string) {
    try {
        const html = await getTextWithTimeout(
            proxyUrl(url, true)
        )
        const matches = html.match(
            new RegExp('(https?://)?[\\w\\u4e00-\\u9fa5-./@%?:]+?\\.(m3u8|webm|mp4)', 'i')
        )
        if (matches) {
            return parseUrl(matches.at(0), url)
        }
        else {
            throw new Error('😥 not matched.')
        }
    }
    catch (err) {
        return null
    }
}

const handler: ApiHandler = async (req, res) => {
    const { token } = req.params
    const url = Base64Params.parse(token)
    const data = await parseVideoUrl(url)
    res.json(data ? createPayload(data) : createErrorPayload())
}

export default errorHandler(handler)