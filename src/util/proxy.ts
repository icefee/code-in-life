import { Api } from './config'
import { Base64Params } from './clue'

export function getParamsUrl(url: string, params: Record<string, string>) {
    const urlSearchParams = new URLSearchParams(params)
    return `${url}?${urlSearchParams}`
}

export function proxyUrl(url: string, remote: boolean = false, extend = {}) {
    return getParamsUrl(`${remote ? Api.assetSite : ''}/api/proxy`, {
        url,
        ...extend
    })
}

export function proxyHlsUrl(url: string) {
    const token = Base64Params.create(url)
    return getParamsUrl(`${Api.assetSite}/api/video/hls/proxy/${token}`, {
        cors: '1'
    })
}

export function pureHlsUrl(url: string) {
    const token = Base64Params.create(url)
    return `/api/video/pure/${token}`
}

export function parseUrl(url: string, base: string) {
    return url.startsWith('http') ? url : new URL(url, base).href
}

async function loadFileChunk(url: string, [start, end]: [number, number], init?: RequestInit) {
    const headers = new Headers(init?.headers)
    headers.append('range', `bytes=${start}-${end}`)
    return fetch(url, {
        ...init,
        headers
    })
}

export async function fetchFileChunks(
    url: string,
    { chunkSize, ...init }: RequestInit & { chunkSize: number }
): Promise<ArrayBuffer> {
    const response = await loadFileChunk(url, [0, chunkSize - 1], init)
    const headers = response.headers
    const totalBytes = Number(headers.get('content-range')?.match(/\d+$/))
    const firstChunk = await response.arrayBuffer()
    if (totalBytes <= chunkSize) {
        return firstChunk
    }
    const chunks = await Promise.all(
        Array.from(
            {
                length: Math.ceil((totalBytes - chunkSize) / chunkSize)
            },
            async (_, index) => {
                let byteOffset = chunkSize * (index + 1)
                const response = await loadFileChunk(url, [byteOffset, Math.min(byteOffset + chunkSize - 1, totalBytes - 1)], init);
                return response.arrayBuffer();
            }
        )
    )
    const dataArray = new Uint8Array(totalBytes)
    let dataArrayByteOffset = 0;
    for (let chunk of [firstChunk, ...chunks]) {
        const dataPart = new Uint8Array(chunk);
        dataArray.set(dataPart, dataArrayByteOffset);
        dataArrayByteOffset += dataPart.byteLength;
    }
    return dataArray.buffer
}

export function removeAds(
    content: string,
    urlParser: (url: string) => string = (url) => url
) {
    const discontinuityTag = /#EXT-X-DISCONTINUITY/
    const extInfMatcher = new RegExp('#EXTINF:\\d+(.\\d+)?,')
    const keyLineMatcher = /URI=".+\.k(ey)?"/
    const lines = content.split(/\n/).filter(line => line.trim().length > 0)
    const parts = []
    let extLine = false, pathLength: number | null = null
    let segmentIndex: number | null = null, segmentLinearSize = 0
    let inDiscontinuity = false
    const segmentSize = lines.filter(
        line => line.match(extInfMatcher)
    ).length;
    const discontinuitySize = lines.filter(
        line => line.match(discontinuityTag)
    ).length;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (line.match(discontinuityTag)) {
            if (discontinuitySize === 2) {
                inDiscontinuity = !inDiscontinuity
            }
            continue;
        }
        if (inDiscontinuity) {
            continue;
        }
        const keyLineMatch = line.match(keyLineMatcher)
        if (keyLineMatch) {
            const keyMatcher = /(?<=URI=").+\.k(ey)?(?=")/
            const key = keyLineMatch[0].match(keyMatcher)?.[0]
            parts.push(
                line.replace(keyMatcher, urlParser(key))
            )
        }
        else if (extLine) {
            pathLength = pathLength ?? line.length
            const segmentIndexMatch = line.match(/\d+(?=\.(ts|png|csv)(\?=\w+)?$)/)
            if (segmentIndexMatch) {
                const matchedIndex = segmentIndexMatch[0]
                const index = Number(matchedIndex)
                if (Math.pow(10, matchedIndex.length) > segmentSize && segmentIndex !== null && index === segmentLinearSize + 1) {
                    segmentLinearSize++
                }
                segmentIndex = index
            }
            if ((!segmentIndexMatch || segmentIndex !== segmentLinearSize) && segmentLinearSize > 3 || line.length > pathLength + 3) {
                parts.pop()
            }
            else {
                parts.push(urlParser(line))
            }
        }
        else {
            parts.push(line)
        }
        extLine = Boolean(line.match(extInfMatcher))
    }
    return parts.join('\n')
}
