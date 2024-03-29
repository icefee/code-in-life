import { Api } from './config'
import { Base64Params } from './clue'

type ParamsType = Record<string, string>

export function getResponse(...args: Parameters<typeof fetch>): Promise<Response> {
    return fetch(...args)
}

export async function getJson<T = any>(...args: Parameters<typeof fetch>): Promise<T> {
    return getResponse(...args).then<T>(
        response => response.json()
    )
}

export function getParamsUrl(url: string, params: ParamsType) {
    const urlSearchParams = new URLSearchParams(params)
    return `${url}?${urlSearchParams}`
}

export function proxyUrl(url: string, remote: boolean = false, extend: ParamsType = {}) {
    return getParamsUrl(`${remote ? Api.assetSite : ''}/api/proxy`, {
        url,
        ...extend
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
                const response = await loadFileChunk(
                    url,
                    [byteOffset, Math.min(byteOffset + chunkSize - 1, totalBytes - 1)],
                    init
                )
                return response.arrayBuffer()
            }
        )
    )
    const dataArray = new Uint8Array(totalBytes)
    let dataArrayByteOffset = 0
    for (let chunk of [firstChunk, ...chunks]) {
        const dataPart = new Uint8Array(chunk)
        dataArray.set(dataPart, dataArrayByteOffset)
        dataArrayByteOffset += dataPart.byteLength
    }
    return dataArray.buffer
}

function extInfLine(line: string) {
    const extInfMatcher = new RegExp('#EXTINF:\\d+(.\\d+)?,')
    return extInfMatcher.test(line)
}

export function removeAds(
    content: string,
    urlParser: (url: string) => string = (url) => url
) {
    const discontinuityTag = /#EXT-X-DISCONTINUITY/
    const keyLineMatcher = /URI=".+\.k(ey)?"/
    const lines = content.split(/\n/).filter(line => line.trim().length > 0)
    const parts = []
    let extLine = false
    let segmentIndex: number | null = null,
        segmentLinearSize = 0
    for (const line of lines) {
        if (line.match(discontinuityTag)) {
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
            const segmentIndexMatch = line.match(/\d+(?=\.(ts|png|csv)(\?=\w+)?$)/)
            const parsedLine = urlParser(line)
            if (segmentIndexMatch) {
                const segmentIndexLabel = segmentIndexMatch[0]
                const index = Number(
                    segmentIndexLabel.slice(
                        Math.max(0, segmentIndexLabel.length - 6)
                    )
                )
                if (
                    segmentIndex !== null
                    && index === segmentIndex + 1
                ) {
                    segmentLinearSize++
                }
                if (
                    segmentLinearSize > 3
                    && index > segmentIndex + 3
                ) {
                    parts.pop()
                }
                else {
                    parts.push(parsedLine)
                    segmentIndex = index
                }
            }
            else {
                parts.push(parsedLine)
            }
        }
        else {
            parts.push(line)
        }
        extLine = extInfLine(line)
    }
    return parts.join('\n')
}