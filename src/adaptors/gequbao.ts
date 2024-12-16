import { cheerio, getTextWithTimeout, getResponse, parseLrcText } from './common'
import { timeFormatter } from '../util/date'
import { Api } from '../util/config'

export const key = 'g'

export const baseUrl = 'https://www.gequbao.com'

export async function getMusicSearch(s: string): Promise<SearchMusic[]> {
    const url = `${baseUrl}/s/${s}`;
    try {
        const html = await getTextWithTimeout(url)
        const $ = cheerio.load(html)
        const blocks = $('.card-text .row .music-link')
        const songs = [] as SearchMusic[]
        if (blocks) {
            for (let i = 0; i < blocks.length; i++) {
                const block = $(blocks[i])
                const id = key + block.attr('href').match(/\d+$/)?.[0]
                const name = block.find('.music-title span').text()
                const artist = block.find('small.text-jade').text().trim()
                songs.push({
                    id,
                    name,
                    artist,
                    url: `/api/music/play/${id}`,
                    poster: `${Api.posterServer}/api/music/poster/${id}`
                })
            }
        }
        return songs
    }
    catch (err) {
        return null
    }
}

async function getPageSource(id: string) {
    const url = `${baseUrl}/music/${id}`
    const response = await getResponse(url)
    if (response.status === 403) {
        const cookie = response.headers.get('set-cookie').split(';')[0]
        return getTextWithTimeout(url, {
            headers: {
                cookie
            }
        })
    }
    return response.text()
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
    const lrc = await parseLrc(id)
    return lrc?.map(
        ({ time, text }) => {
            const seconds = Math.floor(time)
            return `[${timeFormatter(seconds)}:${Math.round((time - seconds) * 1000)}]${text}`
        }
    ).join('\n')
}
