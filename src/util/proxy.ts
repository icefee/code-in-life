import { Api } from './config'

export function getParamsUrl(url: string, params: Record<string, string>) {
    const urlSearchParams = new URLSearchParams(params)
    return `${url}?${urlSearchParams}`
}

export function proxyUrl(url: string, remote: boolean = false) {
    return getParamsUrl(`${remote ? Api.assetSite : ''}/api/proxy`, { url })
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
    console.log(totalBytes)
    const dataArray = new Uint8Array(totalBytes)
    let dataArrayByteOffset = 0;
    for (let chunk of [firstChunk, ...chunks]) {
        const dataPart = new Uint8Array(chunk);
        dataArray.set(dataPart, dataArrayByteOffset);
        dataArrayByteOffset += dataPart.byteLength;
    }
    return dataArray.buffer
}