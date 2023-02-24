import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { Api } from '../../util/config';
import { jsonBase64 } from '../../util/parser';
import type { SearchVideo } from '../../components/search/api';
import fetch from 'node-fetch';

async function getSearch(s: string): Promise<SearchVideo[]> {
    const searchParams = new URLSearchParams()
    if (s.startsWith('$')) {
        searchParams.set('s', s.slice(1))
        searchParams.set('prefer', '18')
    }
    else {
        searchParams.set('s', s)
    }
    const url = Api.site + `/video/search/api?${searchParams.toString()}`;
    try {
        const list = await fetch(url).then(
            response => jsonBase64<SearchVideo[]>(response)
        )
        return list || [];
    }
    catch (err) {
        return null
    }
}

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { s = '' } = req.query;
    const data = await getSearch(s)
    if (data) {
        res.json({
            code: 0,
            data,
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
