import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { createApiAdaptor, parseId, getResponse } from '../../../../adaptors';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { key, id } = parseId(req.params.id);
    const adaptor = createApiAdaptor(key);
    const { name } = req.query;
    if (name) {
        res.setHeader('Content-Disposition', `attachment; filename* = UTF-8''${encodeURIComponent(name)}.lrc`);
    }
    if (adaptor.lrcFile) {
        const response = await getResponse(adaptor.getLrcUrl(id));
        const headers = response.headers;
        for (const key of headers.keys()) {
            res.setHeader(key, headers.get(key))
        }
        response.body.pipe(res);
    }
    else {
        const lrcText = await adaptor.getLrcText(id)
        if (lrcText) {
            res.setHeader('Content-Type', 'text/lrc')
            res.send(lrcText)
        }
        else {
            res.json({
                code: -1,
                data: null,
                msg: 'lrc file not found.'
            })
        }
    }
}
