import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { createApiAdaptor, parseId } from '../../../adaptors';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { key, id } = parseId(req.params.id);
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
