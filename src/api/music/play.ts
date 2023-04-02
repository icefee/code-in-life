import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { Api } from '../../util/config';

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
    const { id } = req.query;
    const url = await parseMusicUrl(id);
    if (url) {
        res.writeHead(301, {
            location: url
        })
        res.end()
    }
    else {
        res.json({
            code: -1,
            data: null,
            msg: '失败'
        })
    }
}
