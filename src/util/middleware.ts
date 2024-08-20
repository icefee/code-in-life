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
    const chunkSize = maxChunkSize / 4
    if (end === 0 || end - start > chunkSize) {
        end = start + chunkSize - 1
    }
    return `${rangePrefix}${start}-${end}`
}

export function rangeContentIntact(range: string | null) {
    if (range) {
        const [start, end] = range.replace(/^bytes\s0-/, '').split('/').map(Number)
        return end - start === 1
    }
    return false
}

export const createPayload = <T = unknown>(data: T) => {
    return {
        code: 0,
        data,
        msg: '成功'
    }
}

export const createErrorPayload = (error: any = '失败') => {
    const msg = error instanceof Error ? error.message : String(error)
    return {
        code: -1,
        data: null,
        msg
    }
}

export const errorHandler: ApiHandlerMiddleware = (handler) => {
    return async function middlewareHandler(req, res) {
        try {
            await handler(req, res)
        }
        catch (err) {
            res.json(
                createErrorPayload(err)
            )
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