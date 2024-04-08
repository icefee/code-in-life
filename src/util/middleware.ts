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
