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
        const lines = content.split(/\n/)
        const pured = lines.map(
            (line) => {
                if (line.match(/.+\/mixed\.m3u8$/)) {
                    const puredLine = line.replace(/mixed\.m3u8/, 'index.m3u8')
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
        res.end(pured)
    }
    catch (err) {
        res.redirect(url)
    }
}

export default errorHandler(handler)