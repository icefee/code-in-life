import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { getM3u8Url } from '../../components/search/api';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { url } = req.query;
    const parsedUrl = await getM3u8Url(url)
    if (parsedUrl) {
        res.json({
            code: 0,
            data: parsedUrl,
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
