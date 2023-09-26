import { Buffer } from 'buffer'
import { getResponse } from '../../adaptors'
import { errorHandler, ApiHandler } from '../../util/middleware'
import { proxyUrl, parseUrl, removeAds } from '../../util/proxy'
import { M3u8 } from '../../util/regExp'

const handler: ApiHandler = async (req, res) => {
    const { url } = req.query
    try {
        let actualUrl = url;
        let response = await getResponse(proxyUrl(url, true), {
            timeout: 8e3
        })
        let playList = await response.text()
        if (!M3u8.checkContent(playList)) {
            throw new Error('invalid m3u8 format')
        }
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
            actualUrl = parseUrl(maxBandwidthUrl, url)
            response = await getResponse(proxyUrl(actualUrl, true))
            playList = await response.text()
        }
        const inheritedHeaders = [
            'content-type',
            'content-range',
            'accept-ranges',
            // 'transfer-encoding',
            'connection'
        ]
        const headers = response.headers
        for (const header of inheritedHeaders) {
            if (headers.has(header)) {
                res.setHeader(header, headers.get(header))
            }
        }
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