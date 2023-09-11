import { getResponse } from '../../adaptors'
import { errorHandler, ApiHandler } from '../../util/middleware'

const handler: ApiHandler = async (req, res) => {
    const { url } = req.query
    try {
        const response = await getResponse(url)
        const content = await response.text()
        const pured = content.replace(/mixed\.m3u8/, 'index.m3u8')
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