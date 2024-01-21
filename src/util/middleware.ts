import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby'
import { getResponse } from '../adaptors'

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


export const proxyJson = async (url: string, res: GatsbyFunctionResponse) => {
    const response = await getResponse(url)
    const contentType = response.headers.get('content-type')
    if (/application\/json/.test(contentType)) {
        res.setHeader('content-type', 'application/json')
        response.body.pipe(res)
    }
    else {
        proxyJson(url, res)
    }
}


export const crossOriginIsolatedHeaders = {
    'cross-origin-embedder-policy': 'require-corp',
    'cross-origin-opener-policy': 'same-origin'
}