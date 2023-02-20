import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { Api } from '../../../util/config';
import { jsonBase64 } from '../../../util/parser';
import type { VideoInfo } from '../../../components/search/api';
import fetch from 'node-fetch';

async function getVideoInfo(api: string, id: string): Promise<VideoInfo | string> {
    try {
        const videoInfo = await fetch(`${Api.site}/video/api?api=${api}&id=${id}`).then(
            response => {
                /* @ts-ignore */
                return jsonBase64<VideoInfo>(response);
            }
        )
        if (videoInfo) {
            return videoInfo;
        }
        else {
            throw new Error('fetch error.')
        }
    }
    catch (err) {
        return String(err);
    }
}

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { site, id } = req.params;
    const data = await getVideoInfo(site, id)
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
