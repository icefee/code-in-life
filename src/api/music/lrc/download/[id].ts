import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { createApiAdaptor, parseId, getResponse } from '../../../../adaptors';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { id: paramId } = req.params;
    const { name } = req.query;
    const { key, id } = parseId(paramId);
    const adaptor = createApiAdaptor(key);
    if (name) {
        res.setHeader('Content-Disposition', `attachment; filename* = UTF-8''${encodeURIComponent(name)}.lrc`);
    }
    if (adaptor.lrcFile) {
        const response = await getResponse(adaptor.getLrcUrl(id));
        const headers = response.headers;
        for (let key of headers.keys()) {
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
