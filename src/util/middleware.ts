import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby'

export function appendContentDisposition(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse, ext: string) {
    const { name } = req.query
    if (name) {
        res.setHeader('content-disposition', `attachment; filename* = UTF-8''${encodeURIComponent(name)}.${ext}`)
    }
    return res
}
