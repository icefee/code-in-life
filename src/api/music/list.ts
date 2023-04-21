import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { createApiAdaptor, adaptors } from '../../adaptors';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { s } = req.query;
    const list: SearchMusic[] = [];

    for (const k of adaptors) {
        const adaptor = createApiAdaptor(k);
        const result = await adaptor.getMusicSearch(s);
        if (result) {
            list.push(...result);
        }
    }

    if (list) {
        res.json({
            code: 0,
            data: list,
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
