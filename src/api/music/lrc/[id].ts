import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { createApiAdaptor, parseId } from '../../../adaptors';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { id: paramId } = req.params;
    const { key, id } = parseId(paramId);
    const adaptor = createApiAdaptor(key);
    const lrc = await adaptor.parseLrc(id);
    if (lrc) {
        res.json({
            code: 0,
            data: lrc,
            msg: '成功'
        })
    }
    else {
        res.json({
            code: -1,
            data: null,
            msg: '失败'
        })
    }
}
