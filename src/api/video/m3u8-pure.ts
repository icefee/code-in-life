import { Buffer } from 'buffer'
import { getResponse } from '../../adaptors'
import { errorHandler, ApiHandler } from '../../util/middleware'
import { proxyUrl, parseUrl, removeAds } from '../../util/proxy'

const handler: ApiHandler = async (req, res) => {
    const { url } = req.query
    try {
        let actualUrl = url;
        let response = await getResponse(proxyUrl(url, true))
        let playList = await response.text()
        const streamInfoMatcher = /#EXT-X-STREAM-INF/
        const streamInfos = playList.match(streamInfoMatcher)
        if (streamInfos) {
            const lines = playList.split(/\n/)
            const bandwidthMatcher = /BANDWIDTH=\d+/
            let bandwidth = 0, maxBandwidthUrl: string | null = null
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.match(streamInfoMatcher)) {
                    const currentBandwidth = Number(
                        line.match(bandwidthMatcher)?.[0]?.match(/\d+/)?.[0]
                    )
                    if (currentBandwidth > bandwidth) {
                        maxBandwidthUrl = lines[i + 1]
                        bandwidth = currentBandwidth
                    }
                }
            }
            actualUrl = parseUrl(maxBandwidthUrl.replace(/mixed\.m3u8/g, 'index.m3u8'), url)
            response = await getResponse(actualUrl)
            playList = await response.text()
        }
        response.headers.forEach(
            (header, key) => {
                res.setHeader(key, header)
            }
        )
        const pured = removeAds( // /01o/,
            playList,
            (url) => parseUrl(url, actualUrl)
        )
        const buffer = Buffer.from(pured)
        res.setHeader('content-length', buffer.byteLength)
        res.end(pured)
    }
    catch (err) {
        res.redirect(url)
    }
}

export default errorHandler(handler)