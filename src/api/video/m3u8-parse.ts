import Hls2Mp4 from 'hls2mp4'
import { getTextWithTimeout } from '../../adaptors'
import { errorHandler, ApiHandler } from '../../util/middleware'

const handler: ApiHandler = async (req, res) => {
    const { url } = req.query
    const m3u8 = await Hls2Mp4.parseM3u8File(
        url,
        (url) => getTextWithTimeout(url)
    )
    res.setHeader('content-type', 'application/vnd.apple.mpegURL')
    res.setHeader('transfer-encoding', 'chunked')
    res.setHeader('connection', 'keep-alive')
    res.end(
        m3u8.content.replace(/(^|(?<=URI\="))\/?[\w\/]+.(ts|key)/gmi, (v) => new URL(v, m3u8.url).href)
    )
}

export default errorHandler(handler)