import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { createApiAdaptor, adaptors, type Adaptor } from '../../adaptors';

async function getAdaptorSearch(key: Adaptor, s: string) {
    const adaptor = createApiAdaptor(key)
    try {
        const result = await adaptor.getMusicSearch(s)
        return result;
    }
    catch (err) {
        return null
    }
}

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { s } = req.query;
    const list: SearchMusic[] = [];

    for (let k of adaptors) {
        const result = await getAdaptorSearch(k, s)
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
