import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { Api } from '../../../../util/config';
import { image } from '../../../../util/parser';
import { setCommonHeaders } from '../../../../util/pipe';

async function getPosterUrl(api: string, id: string) {
    const url = `${Api.site}/video/${api}/${id}/poster`;
    try {
        const parsedUrl = await fetch(url).then(image);
        return parsedUrl;
    }
    catch (err) {
        return null;
    }
}

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { site, id } = req.params;
    const posterUrl = await getPosterUrl(site, id);
    setCommonHeaders(res);
    if (posterUrl) {
        res.json({
            code: 0,
            data: posterUrl,
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
