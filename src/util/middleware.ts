import type { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby'

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

export const errorHandler: ApiHandlerMiddleware = (handler: ApiHandler) => {
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