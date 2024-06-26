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
    return `${Api.assetSite}/api/video/hls/pure/${token}.m3u8`
}

export function parseUrl(url: string, base: string) {
    return url.startsWith('http') ? url : new URL(url, base).href
}

export async function loadFileChunk(url: string, [start, end]: [number, number], init?: RequestInit) {
    const headers = new Headers(init?.headers)
    headers.append('range', `bytes=${start}-${end}`)
    return fetch(url, {
        ...init,
        headers
    })
}

export async function loadFileChunks(
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