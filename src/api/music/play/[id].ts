import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { Api } from '../../../util/config';
import { isDev } from '../../../util/env';

async function parseMusicUrl(id: string) {
    try {
        const html = await fetch(`${Api.music}/music/${id}`).then(
            response => response.text()
        )
        const matchBlock = html.match(
            /const url = 'https?:\/\/[^']+'/
        )
        return matchBlock[0].match(/https?:\/\/[^']+/)[0];
    }
    catch (err) {
        return null
    }
}

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { id } = req.params;
    const url = await parseMusicUrl(id);
    if (url) {
        if (isDev) {
            const response = await fetch(url);
            const headers = response.headers;
            for (let key of headers.keys()) {
                res.setHeader(key, headers.get(key))
            }
            response.body.pipe(res);
        }
        else {
            res.writeHead(301, {
                location: url
            })
            res.end()
        }
    }
    else {
        res.json({
            code: -1,
            data: null,
            msg: '失败'
        })
    }
}
