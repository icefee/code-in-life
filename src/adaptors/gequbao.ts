import { getTextWithTimeout, getResponse, parseLrcText, escapeSymbols } from './common'
import { timeFormatter } from '../util/date'
import { Api } from '../util/config'

export const key = 'g'

export const baseUrl = 'https://www.gequbao.com'

const getHtml = (url: string) => getTextWithTimeout(url, {
    headers: {
        'cache-control': 'no-cache'
    }
})

export async function getMusicSearch(s: string): Promise<SearchMusic[]> {
    const url = `${baseUrl}/s/${s}`;
    try {
        const html = await getHtml(url)
        const matchBlocks = escapeSymbols(html).replace(/[\n\r]+/g, '').match(
            /<div class="row">\s*<div class="col-5 col-content">\s*<a href="\/music\/\d+"\s*class="text-primary font-weight-bold"\s+target="_blank">[^<]+<\/a>\s*<\/div>\s*<div class="text-success col-4 col-content">[^<]+<\/div>\s*<div class="col-3 col-content text-right">\s*<a href="\/music\/\d+" target="_blank"><u>下载<\/u><\/a>\s*<\/div>\s*<\/div>/g
        )
        if (matchBlocks) {
            return matchBlocks.map(
                (block) => {
                    const url = block.match(/music\/\d+/)[0]
                    const idMatch = url.match(/\d+/)[0]
                    const nameMatch = block.match(/(?<=<a href="\/music\/\d+"\s*class="text-primary\s+font-weight-bold"\s+target="_blank">)[^<]+(?=<\/a>)/)[0]
                    const artistMatch = block.match(/(?<=<div\s+class="text-success\s+col-4\s+col-content">)[^<]+(?=<\/div>)/)[0]
                    const id = key + idMatch
                    return {
                        id,
                        name: nameMatch.trim(),
                        artist: artistMatch.trim(),
                        url: `/api/music/play/${id}`,
                        poster: `${Api.posterServer}/api/music/poster/${id}`
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

function getPageSource(id: string) {
    return getHtml(`${baseUrl}/music/${id}`)
}

function parsePosterUrl(html: string) {
    const matchCover = html.match(
        /mp3_cover\s=\s'https?:\/\/[^']+'/
    )?.[0]
    if (matchCover) {
        return matchCover.slice(13, matchCover.length - 1)
    }
    return null
}

export async function parsePoster(id: string) {
    try {
        const html = await getPageSource(id)
        const poster = parsePosterUrl(html)
        return poster
    }
    catch (err) {
        return null
    }
}

async function getPlayUrl(id: string) {
    const html = await getPageSource(id)
    const matchId = html.match(
        /play_id\s=\s'[\w\=]+'/
    )[0]
    const clue = matchId.slice(11, matchId.length - 1)
    const searchParams = new URLSearchParams({
        id: clue
    })
    const { code, data } = await getResponse(`${baseUrl}/api/play-url`, {
        method: 'POST',
        body: searchParams
    }).then<{
        code: number;
        data: {
            url: string;
        }
    }>(
        (response) => response.json()
    )
    return code === 1 ? data.url : null
}

export async function parseMusicUrl(id: string) {
    try {
        const html = await getPageSource(id)
        const urlMatcher = /https?:\/\/[^']+/
        const matchBlock = html.match(
            new RegExp(`window.mp3_url = '${urlMatcher.source}'`)
        )
        if (matchBlock) {
            return matchBlock[0].match(urlMatcher)[0]
        }
        return getPlayUrl(id)
    }
    catch (err) {
        return null
    }
}

export async function parseLrc(id: string) {
    try {
        const html = await getPageSource(id)
        const lrcText = html.match(
            /(?<=id="content-lrc">)(.|\n)+?(?=<\/div>)/
        )?.[0]
        return parseLrcText(lrcText.replaceAll('<br />', '\n'))
    }
    catch (err) {
        return null
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