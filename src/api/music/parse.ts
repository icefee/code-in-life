import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { Api } from '../../util/config';

function parseUrl(html: string) {
    const matchBlock = html.match(
        /const url = 'https?:\/\/[^']+'/
    )
    return matchBlock[0].match(/https?:\/\/[^']+/)[0].replace(new RegExp('&amp;', 'g'), '&')
}

function parsePoster(html: string) {
    const matchBlock = html.match(
        /<img id="cover" src="https?:\/\/[^"]+"/
    )
    return matchBlock[0].match(/https?:\/\/[^"]+/)[0]
}

async function getMusic(id: string) {
    try {
        const html = await fetch(`${Api.music}/music/${id}`).then(
            response => response.text()
        )
        const url = parseUrl(html)
        const poster = parsePoster(html)
        return {
            url,
            poster
        }
    }
    catch (err) {
        return null
    }
}

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { id } = req.query;
    const music = await getMusic(id)
    if (music) {
        res.json({
            code: 0,
            data: music,
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
