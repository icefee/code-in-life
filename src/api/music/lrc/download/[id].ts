import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { createApiAdaptor, parseId, getResponse } from '../../../../adaptors';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { id: paramId } = req.params;
    const { key, id } = parseId(paramId);
    const adaptor = createApiAdaptor(key);
    const { name } = req.query;
    const response = await getResponse(adaptor.getLrcUrl(id));
    const headers = response.headers;
    if (name) {
        headers.set('Content-Disposition', `attachment; filename* = UTF-8''${encodeURIComponent(name)}.lrc`);
    }
    for (let key of headers.keys()) {
        res.setHeader(key, headers.get(key))
    }
    response.body.pipe(res);
}
