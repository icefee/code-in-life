import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { Api } from '../../../../util/config';
import { setCommonHeaders } from '../../../../util/pipe';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { site, id } = req.params;
    const { type } = req.query;
    let api = `${Api.site}/api/video/${site}/${id}`;
    if (type) {
        api += `?type=${type}`;
    }
    const response = await fetch(api)
    setCommonHeaders(res)
    res.setHeader('Content-Type', 'application/json')
    response.body.pipe(res)
}
