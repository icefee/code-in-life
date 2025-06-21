import { cheerio, getJson, parseLrcText, getTextWithTimeout } from './common'
import { timeFormatter } from '../util/date'
import { proxyUrl } from '../util/proxy'
import { Api } from '../util/config'

export const key = 'z'

export const baseUrl = 'https://www.zz123.com'

async function getPageSearch(s: string, p: number) {
    const searchParams = new URLSearchParams({
        key: s
    })
    if (p > 1) {
        searchParams.set('page', `${p}`)
    }
    const url = proxyUrl(`${baseUrl}/search/?${searchParams}`, true)
    try {
        const html = await getTextWithTimeout(url)
        const $ = cheerio.load(html)
        const blocks = $('.card-list-item.statistics_item')
        const songs = [] as SearchMusic[]
        const matchReg = new RegExp(s.replace(/\\/g, '\\\\'), 'i')
        if (blocks) {
            for (let i = 0; i < blocks.length; i++) {
                const block = $(blocks[i])
                const id = key + block.attr('data-id')
                const name = block.attr('data-tag')
                const artist = block.find('.singername a').text()
                const poster = block.find('.item-cover img').attr('data-src')
                if ([name, artist].some(s => s.match(matchReg))) {
                    songs.push({
                        id,
                        name,
                        artist,
                        url: `/api/music/play/${id}`,
                        poster
                    })
                }
            }
        }
        console.log(songs)
        return songs
    }
    catch (err) {
        console.log(err)
        return null
    }
}

export async function getMusicSearch(s: string): Promise<SearchMusic[]> {
    let page = 1, pageSize = 50
    let result = [] as SearchMusic[]
    while (true) {
        const songs = await getPageSearch(s, page)
        if (songs) {
            result.push(...songs)
            if (songs.length < pageSize) {
                break
            }
            else {
                page++
            }
        }
        else {
            break
        }
    }
    return result
}

interface MusicInfo {
    mname: string;
    sid: string;
    sname: string;
    pic: string;
    mp3: string;
    playtime: string;
    lrc: string;
}

interface MusicParseApiJson<T = unknown> {
    status: number;
    msg: string;
    data: T;
}

async function getMusicInfo(id: string) {
    const { status, data } = await getJson<MusicParseApiJson<MusicInfo>>(`${Api.proxyUrl}/api/proxy?url=${baseUrl}/ajax/`, {
        method: 'POST',
        body: new URLSearchParams({
            id,
            act: 'songinfo',
            lang: ''
        })
    })
    if (status === 200) {
        return data
    }
    return null
}

function transformUrl(url: string) {
    if (url.startsWith('http')) {
        return url
    }
    return baseUrl + url
}

export async function parsePoster(id: string) {
    try {
        const info = await getMusicInfo(id)
        return transformUrl(info.pic)
    }
    catch (err) {
        return null
    }
}


export async function parseMusicUrl(id: string): Promise<string | null> {
    try {
        const info = await getMusicInfo(id)
        return transformUrl(info.mp3)
    }
    catch (err) {
        return null
    }
}

export async function parseLrc(id: string) {
    try {
        const info = await getMusicInfo(id)
        const lrcs = parseLrcText(info.lrc)
        return lrcs.filter(
            ({ text }) => {
                const domain = new URL(baseUrl).hostname
                    .replace('www', '')
                    .replace(/\.com$/, '')
                return !text.match(new RegExp(domain))
            }
        )
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
