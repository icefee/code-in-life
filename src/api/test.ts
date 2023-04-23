import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { getTextWithTimeout2 } from '../adaptors/common';
export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    try {
        const text = await getTextWithTimeout2(`https://www.gequbao.com`)
        res.json({
            code: 0,
            data: text
        })
    }
    catch (err) {
        res.json({
            code: -1,
            msg: String(err)
        })
    }
}
