import { cheerio, getTextWithTimeout, getResponse, parseLrcText } from './common'
import { timeFormatter } from '../util/date'
import { Api } from '../util/config'

export const key = 'g'

export const baseUrl = 'https://www.gequbao.com'

export async function getMusicSearch(s: string): Promise<SearchMusic[]> {
    const url = `${baseUrl}/s/${s}`
    try {
        const html = await getTextWithTimeout(url)
        const $ = cheerio.load(html)
        const blocks = $('.card-text .row .d-block')
        const songs = [] as SearchMusic[]
        if (blocks) {
            for (let i = 0; i < blocks.length; i++) {
                const block = $(blocks[i])
                const id = key + block.attr('href').match(/\d+$/)?.[0]
                const [name, artist] = block.attr('title').split(' - ')
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
    return response.text()
}

export async function parsePoster(id: string) {
    try {
        const html = await getPageSource(id)
        const $ = cheerio.load(html)
        return $('#aplayer img').attr('src')
    }
    catch (err) {
        return null
    }
}

export async function parseMusicUrl(id: string) {
    try {
        const html = await getPageSource(id)
        const dataJson = html.match(
            /(?<=window.appData\s*=\s*JSON.parse\(').+?(?='\);)/
        )?.[0]
        const { play_id } = JSON.parse(
            dataJson
                .replace(/\\u0022/g, '"')
                .replace(/\\u([0-9a-fA-F]{4})/g, '\\\\u$1')
        )
        const { code, data } = await getResponse(`${baseUrl}/api/play-url`, {
            method: 'POST',
            body: new URLSearchParams({
                id: play_id
            })
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
    catch (err) {
        return null
    }
}

export async function parseLrc(id: string) {
    try {
        const html = await getPageSource(id)
        const $ = cheerio.load(html)
        const lrcText = $('#content-lrc').text()
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
