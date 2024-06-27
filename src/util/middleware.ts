import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby'
import { getResponse } from '../adaptors'
import { maxChunkSize } from './config'

export interface ApiHandler {
    (req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void>;
}

interface ApiHandlerMiddleware {
    (handler: ApiHandler): ApiHandler;
}

export function appendContentDisposition(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse, ext: string) {
    const { name } = req.query
    if (name) {
        res.setHeader('content-disposition', `attachment; filename* = UTF-8''${encodeURIComponent(name)}.${ext}`)
    }
    return res
}

export function restrictRange(range: string) {
    const rangePrefix = 'bytes='
    let [start, end] = range.replace(rangePrefix, '').split('-').map(Number)
    const chunkSize = maxChunkSize / 2
    let chunkOffset = chunkSize
    if (start === 0) {
        chunkOffset -= 1
    }
    if (end === 0 || end - start > chunkSize) {
        end = start + chunkOffset
    }
    return `${rangePrefix}${start}-${end}`
}

export function rangeContentIntact(range: string | null) {
    if (range) {
        const [start, end] = range.replace(/^bytes\s\d+-/, '').split('/').map(Number)
        return start === end
    }
    return false
}

export const errorHandler: ApiHandlerMiddleware = (handler: ApiHandler) => {
    return async function middlewareHandler(req, res) {
        try {
            await handler(req, res)
        }
        catch (err) {
            res.json({
                code: -1,
                data: null,
                msg: String(err)
            })
        }
    }
}


export const proxyJson = async (url: string, res: GatsbyFunctionResponse) => {
    const response = await getResponse(url)
    if (response.ok) {
        res.setHeader('content-type', 'application/json')
        response.body.pipe(res)
    }
    else {
        return proxyJson(url, res)
    }
}