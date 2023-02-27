import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { Api } from '../../../../util/config';
import { jsonBase64 } from '../../../../util/parser';
import type { VideoInfo } from '../../../../components/search/api';
import { setCommonHeaders } from '../../../../util/pipe';

async function getVideo(api: string, id: string): Promise<VideoInfo> {
    try {
        const videoInfo = await fetch(`${Api.site}/video/api?api=${api}&id=${id}`).then(
            response => jsonBase64<VideoInfo>(response)
        )
        if (videoInfo) {
            return videoInfo;
        }
        else {
            throw new Error('fetch error.')
        }
    }
    catch (err) {
        return null;
    }
}

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { site, id } = req.params;
    const { type } = req.query;
    const video = await getVideo(site, id);
    const data = video ? {
        code: 0,
        data: video,
        msg: '成功'
    } : {
        code: -1,
        data: null,
        msg: '失败'
    };
    if (type === 'jsonp') {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
        res.setHeader('Accept-Ranges', 'bytes')
        res.send(
            `window.__getVideo && window.__getVideo(${JSON.stringify(data)})`
        )
    }
    else {
        setCommonHeaders(res)
        res.json(data)
    }
}
