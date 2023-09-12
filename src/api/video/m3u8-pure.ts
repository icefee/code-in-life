import { getTextWithTimeout, getResponse } from '../../adaptors'
import { errorHandler, ApiHandler } from '../../util/middleware'
import { proxyUrl, removeAds } from '../../util/proxy'

const handler: ApiHandler = async (req, res) => {
    const { url } = req.query
    try {
        const source = await getTextWithTimeout(
            proxyUrl(url, true)
        )
        if (source.match(/.+\/mixed\.m3u8$/m)) {
            const lines = source.split(/\n/)
            const line = lines.find(
                line => line.match(/.+\/mixed\.m3u8$/)
            )
            if (line) {
                const puredLine = line.replace(/mixed\.m3u8/g, 'index.m3u8')
                const playList = puredLine.startsWith('http') ? puredLine : new URL(puredLine, url).href
                const response = await getResponse(playList)
                response.headers.forEach(
                    (header, key) => {
                        res.setHeader(key, header)
                    }
                )
                const content = await response.text()
                const pured = removeAds(content, '01o')
                const buffer = Buffer.from(pured)
                res.setHeader('content-length', buffer.byteLength)
                res.end(pured)
            }
            else {
                throw new Error('no mixed file matched')
            }
        }
        else {
            throw new Error('no need to pure required')
        }
    }
    catch (err) {
        res.redirect(url)
    }
}

export default errorHandler(handler)