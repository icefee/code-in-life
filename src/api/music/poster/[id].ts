import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { Api } from '../../../util/config';

function parsePoster(html: string) {
    const matchBlock = html.match(
        /cover:\s'https?:\/\/[^']+'/
    )
    return matchBlock ? matchBlock[0].match(/https?:\/\/[^']+/)[0] : null
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

const svg = `<svg t="1677728469768" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3429" width="128" height="128"><path d="M1023.969343 511.946281A511.77753 511.77753 0 1 1 626.119623 12.873428a503.76806 503.76806 0 0 1 82.856588 26.376014 512.329907 512.329907 0 0 1 314.993132 472.696839z" fill="#EA5D5B" p-id="3430"></path><path d="M708.976211 39.249442v472.696839h-82.856588V12.873428a503.76806 503.76806 0 0 1 82.856588 26.376014z" fill="#444" p-id="3431"></path><path d="M511.915624 709.006868a197.060587 197.060587 0 1 1 197.060587-197.060587 197.198681 197.198681 0 0 1-197.060587 197.060587z m0-311.264585a114.203998 114.203998 0 1 0 114.203999 114.203998 114.342093 114.342093 0 0 0-114.203999-114.203998z" fill="#444" p-id="3432"></path></svg>`

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { id } = req.params;
    const poster = await getPoster(id);
    try {
        if (poster) {
            res.writeHead(301, {
                'location': poster
            })
            res.end()
        }
        else {
            throw new Error('can not find poster')
        }
    }
    catch (err) {
        res.setHeader('Content-Type', 'image/svg+xml')
        res.send(svg)
    }
}
