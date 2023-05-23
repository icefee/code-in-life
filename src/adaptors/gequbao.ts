import { getTextWithTimeout, parseDuration, isTextNotNull } from './common';
import { timeFormatter } from '../util/date';
import { Api } from '../util/config';

export const key = 'g';

export const baseUrl = 'https://www.gequbao.com';

export const lrcFile = true;

export async function getMusicSearch(s: string): Promise<SearchMusic[]> {
    const url = `${baseUrl}/s/${s}`;
    try {
        const html = await getTextWithTimeout(url)
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
                        name: nameMatch.trim(),
                        artist: artistMatch,
                        url: `/api/music/play/${id}`,
                        poster: `${Api.posterApiPrefix}/api/music/poster/${id}`
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
        const html = await getTextWithTimeout(`${baseUrl}/music/${id}`)
        const poster = parsePosterUrl(html)
        return poster;
    }
    catch (err) {
        return null
    }
}

export async function parseMusicUrl(id: string) {
    try {
        const html = await getTextWithTimeout(`${baseUrl}/music/${id}`)
        const matchBlock = html.match(
            /const url = 'https?:\/\/[^']+'/
        )
        return matchBlock[0].match(/https?:\/\/[^']+/)[0];
    }
    catch (err) {
        return null
    }
}

export async function parseLrc(id: string) {
    try {
        const lrc = await getTextWithTimeout(`${baseUrl}/download/lrc/${id}`)
        const lines = lrc.split(/\n/).filter(
            line => isTextNotNull(line)
        ).map(
            line => {
                const timeMatch = line.match(/\d{1,2}:\d{1,2}\.\d*/)
                const textMatch = line.match(/(?<=]).+(?=($|\r))/)
                return {
                    time: parseDuration(timeMatch[0]),
                    text: textMatch ? textMatch[0] : ''
                }
            }
        ).filter(
            ({ text }) => isTextNotNull(text)
        )
        return lines;
    }
    catch (err) {
        return null;
    }
}

export async function getLrcText(id: string) {
    const lrc = await parseLrc(id);
    return lrc?.map(
        ({ time, text }) => {
            const seconds = Math.floor(time)
            return `[${timeFormatter(seconds)}:${Math.round((time - seconds) * 1000)}]${text}`
        }
    ).join('\n');
}

export function getLrcUrl(id: string) {
    return `${baseUrl}/download/lrc/${id}`
}
