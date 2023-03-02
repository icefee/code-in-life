import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { Api } from '../../util/config';
import { setCommonHeaders } from '../../util/pipe';
import { createReadStream } from 'node:fs';

function parsePoster(html: string) {
    const matchBlock = html.match(
        /<img id="cover" src="https?:\/\/[^"]+"/
    )
    return matchBlock ? matchBlock[0].match(/https?:\/\/[^"]+/)[0] : null
}

async function getPoster(id: string) {
    try {
        const html = await fetch(`${Api.music}/music/${id}`).then(
            response => response.text()
        )
        const poster = parsePoster(html)
        return poster;
    }
    catch (err) {
        return null
    }
}

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { id } = req.query;
    const poster = await getPoster(id);
    setCommonHeaders(res)
    if (poster) {
        const response = await fetch(poster)
        const headers = response.headers;
        res.setHeader('Content-Type', headers.get('Content-Type'));
        response.body.pipe(res)
    }
    else {
        const steam = createReadStream('src/assets/music.png')
        steam.pipe(res)
    }
}
