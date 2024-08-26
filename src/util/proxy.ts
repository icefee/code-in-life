import { Api } from './config'

export function getResponse(...args: Parameters<typeof fetch>): Promise<Response> {
    return fetch(...args)
}

export async function getJson<T = any>(...args: Parameters<typeof fetch>): Promise<T> {
    return getResponse(...args).then<T>(
        response => response.json()
    )
}

export function getParamsUrl(url: string, params: Record<string, string>) {
    const urlSearchParams = new URLSearchParams(params)
    return `${url}?${urlSearchParams}`
}

export function proxyUrl(url: string, remote: boolean = false, extend: Record<string, string> = {}) {
    return getParamsUrl(`${remote ? Api.proxyUrl : ''}/api/proxy`, {
        url,
        ...extend
    })
}

async function loadFileChunk(url: string, [start, end]: [number, number], init?: RequestInit) {
    const headers = new Headers(init?.headers)
    headers.append('range', `bytes=${start}-${end}`)
    return getResponse(url, {
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