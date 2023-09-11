import { getResponse } from '../../adaptors'
import { errorHandler, ApiHandler } from '../../util/middleware'
import { proxyUrl } from '../../util/proxy'

const handler: ApiHandler = async (req, res) => {
    const { url } = req.query
    try {
        const response = await getResponse(
            proxyUrl(url, true)
        )
        const content = await response.text()
        if (content.match(/#EXT-X-STREAM-INF/)) {
            const lines = content.split(/\n/)
            const pured = lines.map(
                (line) => {
                    if (line.match(/\.m3u8$/)) {
                        let puredLine = line
                        if (line.match(/.+\/mixed\.m3u8$/)) {
                            puredLine = line.replace(/mixed\.m3u8/g, 'index.m3u8')
                        }
                        if (puredLine.startsWith('http')) {
                            return puredLine
                        }
                        return new URL(puredLine, url).href
                    }
                    return line
                }
            ).join('\n')
            response.headers.forEach(
                (header, key) => {
                    res.setHeader(key, header)
                }
            )
            const buffer = Buffer.from(pured)
            res.setHeader('content-length', buffer.byteLength)
            res.end(pured)
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