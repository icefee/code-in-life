import { getText } from './common';

export const key = 'g';

export const baseUrl = 'https://www.gequbao.com';

export async function getMusicSearch(s: string): Promise<SearchMusic[]> {
    const url = `${baseUrl}/s/${s}`;
    try {
        const html = await getText(url)
        const matchBlocks = html.replace(/[\n\r]+/g, '').replace(new RegExp('&amp;', 'g'), '&').match(
            /<tr>\s*<td><a href="\/music\/\d+"\s*class="text-primary font-weight-bold"\s+target="_blank">[^<]+<\/a>\s*<\/td>\s*<td class="text-success">[^<]+<\/td>\s*<td><a href="\/music\/\d+" target="_blank"><u>下载<\/u><\/a><\/td>\s*<\/tr>/g
        )
        if (matchBlocks) {
            return matchBlocks.map(
                (block) => {
                    const url = block.match(/music\/\d+/)[0]
                    const idMatch = url.match(/\d+/)[0]
                    const nameMatch = block.match(/(?<=<a href="\/music\/\d+"\s*class="text-primary font-weight-bold" target="_blank">)[^<]+(?=<\/a>)/)[0]
                    const artistMatch = block.match(/(?<=<td class="text-success">)[^<]+(?=<\/td>)/)[0]
                    const id = key + idMatch
                    return {
                        id,
                        name: nameMatch.trimStart().trimEnd(),
                        artist: artistMatch,
                        url: `/api/music/play/${id}`,
                        poster: `/api/music/poster/${id}`
                    }
                }
            )
        }
        return [];
    }
    catch (err) {
        return null;
    }
}

function parsePosterUrl(html: string) {
    const matchBlock = html.match(
        /cover:\s'https?:\/\/[^']+'/
    )
    return matchBlock ? matchBlock[0].match(/https?:\/\/[^']+/)[0] : null
}

export async function parsePoster(id: string) {
    try {
        const html = await getText(`${baseUrl}/music/${id}`)
        const poster = parsePosterUrl(html)
        return poster;
    }
    catch (err) {
        return null
    }
}

export async function parseMusicUrl(id: string) {
    try {
        const html = await getText(`${baseUrl}/music/${id}`)
        const matchBlock = html.match(
            /const url = 'https?:\/\/[^']+'/
        )
        return matchBlock[0].match(/https?:\/\/[^']+/)[0];
    }
    catch (err) {
        return null
    }
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

export async function parseLrc(id: string) {
    try {
        const lrc = await getText(`${baseUrl}/download/lrc/${id}`)
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

export function getLrcUrl(id: SearchMusic['id']) {
    return `${baseUrl}/download/lrc/${id}`
}
