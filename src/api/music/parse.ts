import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { Api } from '../../util/config';
import { setCommonHeaders } from '../../util/pipe';

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
    return matchBlock ? matchBlock[0].match(/https?:\/\/[^"]+/)[0] : null
}

function toPrecision(n: number) {
    return Math.round((n * 100)) / 100;
}

function parseDuration(time: string) {
    const timeStamp = time.match(/^\d{1,2}:\d{1,2}/)
    const [m, s] = timeStamp[0].split(':')
    const millsMatch = time.match(/\.\d*/)
    const mills = parseFloat(millsMatch[0])
    return toPrecision(parseInt(m) * 60 + parseInt(s) + (Number.isNaN(mills) ? 0 : mills))
}

async function parseLrc(id: string) {
    try {
        const lrc = await fetch(`${Api.music}/download/lrc/${id}`).then(
            response => response.text()
        )
        const lines = lrc.split(/\n/).filter(
            s => s.trim().length > 0
        ).map(
            line => {
                const timeMatch = line.match(/\d{1,2}:\d{1,2}\.\d*/)
                const textMatch = line.match(/(?<=]).+(?=($|\r))/)
                return {
                    time: parseDuration(timeMatch[0]),
                    text: textMatch ? textMatch[0] : ''
                }
            }
        )
        return lines;
    }
    catch (err) {
        return null;
    }
}

async function getMusic(id: string) {
    try {
        const html = await fetch(`${Api.music}/music/${id}`).then(
            response => response.text()
        )
        const url = parseUrl(html)
        const poster = parsePoster(html)
        const lrc = await parseLrc(id)
        return {
            url,
            poster,
            lrc
        }
    }
    catch (err) {
        return null
    }
}

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { id } = req.query;
    const music = await getMusic(id)
    setCommonHeaders(res)
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
