import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { getJson } from '../../adaptors';
import { Api } from '../../util/config';
import Clue from '../../util/clue';

const getVideoData = async (url: string) => {
    try {
        const { data } = await getJson<ApiJsonType<VideoInfo>>(url);
        return data;
    }
    catch (err) {
        return null;
    }
}

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { api, id } = Clue.parse(req.params.id);
    const { type } = req.query;
    const apiUrl = `${Api.site}/api/video/${api}/${id}`;
    const data = await getVideoData(apiUrl);
    if (type === 'poster') {
        res.redirect(301, data ? data.pic : `/image_fail.jpg`)
    }
    else {
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