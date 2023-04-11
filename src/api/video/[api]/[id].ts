import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { Api } from '../../../util/config';
import { setCommonHeaders } from '../../../util/pipe';
import { json } from '../../../util/parser';

const getVideoData = async (url: string) => {
    try {
        const { data } = await fetch(url).then<ApiJsonType<VideoInfo>>(json);
        return data;
    }
    catch (err) {
        return null;
    }
}

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { api, id } = req.params;
    const { type } = req.query;
    const apiUrl = `${Api.site}/api/video/${api}/${id}`;
    const data = await getVideoData(apiUrl);
    if (type === 'poster') {
        res.writeHead(301, {
            location: data ? data.pic : `${Api.assetUrl}/assets/image_fail.jpg`
        })
        res.end();
    }
    else {
        setCommonHeaders(res)
        res.json(data ? {
            code: 0,
            data,
            msg: '成功'
        } : {
            code: -1,
            data: null,
            msg: '失败'
        })
    }
}
