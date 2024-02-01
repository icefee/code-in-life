import { getTextWithTimeout, getResponse, parseLrcText, escapeSymbols } from './common'
import { timeFormatter } from '../util/date'
import { userAgent } from '../util/config'
import { Api } from '../util/config'

export const key = 't'

export const baseUrl = 'http://www.2t58.com'

export const lrcFile = true

async function matchSongs(source: string) {
    const matchBlocks = source.match(
        new RegExp(`<div class="name"><a href="/song/\\w+.html" target="_mp3">.+? - .+?</a></div>`, 'gm')
    )
    if (matchBlocks) {
        return matchBlocks.map(
            (block) => {
                const id = key + block.match(
                    new RegExp(`(?<=/song/)\\w+(?=\\.html)`)
                )?.[0]
                const title = block.match(
                    new RegExp(`(?<=target="_mp3">).+?(?=</a>)`)
                )?.[0]
                const [artist, name] = escapeSymbols(title).split(' - ')
                return {
                    id,
                    name,
                    artist,
                    url: `/api/music/play/${id}`,
                    poster: `${Api.proxyServer}/api/music/poster/${id}`
                }
            }
        )
    }
    return []
}

async function getPageSongs(s: string, page: number) {
    let url = `${baseUrl}/so/${s}`
    if (page > 1) {
        url += `/${page}`
    }
    url += '.html'
    try {
        const html = await getTextWithTimeout(url)
        const songs = await matchSongs(html)
        return {
            html,
            songs
        }
    }
    catch (err) {
        return {
            html: '',
            songs: []
        }
    }
}

export async function getMusicSearch(s: string): Promise<SearchMusic[]> {
    const { html, songs } = await getPageSongs(s, 1)
    const pageMatcher = new RegExp(`<a href="/so/${s}/\\d+.html">尾页</a>`)
    const pageMatch = html.match(pageMatcher)
    if (pageMatch) {
        const pages = +pageMatch[0].match(
            new RegExp(`(?<=/so/${s}/)\\d+(?=\\.html)`)
        )[0]
        for (let page = 2; page <= pages; page++) {
            const result = await getPageSongs(s, page)
            songs.push(...result.songs)
        }
    }
    return songs
}

interface ParsedSongType {
    msg: number;
    lkid: number;
    title: string;
    pic: string;
    url: string;
}

async function parseSong(id: string) {
    try {
        const result = await getResponse(`${baseUrl}/js/play.php`, {
            method: 'POST',
            body: new URLSearchParams({
                id,
                type: 'music'
            }),
            headers: {
                'origin': baseUrl,
                'referer': `${baseUrl}/song/${id}.html`,
                'user-agent': userAgent
            }
        }).then<ParsedSongType>(
            response => response.json()
        )
        return result
    }
    catch (err) {
        return null
    }
}

export async function parsePoster(id: string) {
    const result = await parseSong(id)
    return result?.pic
}

export async function parseMusicUrl(id: string) {
    const result = await parseSong(id)
    return result?.url
}

export async function parseLrc(id: string) {
    try {
        const lrc = await getTextWithTimeout(getLrcUrl(id))
        const lrcs = parseLrcText(lrc)
        return lrcs.filter(
            ({ text }) => !text.match(
                new RegExp(
                    new URL(baseUrl).hostname.replace('www.', '')
                )
            )
        )
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

export function getLrcUrl(id: string) {
    return `${baseUrl}/plug/down.php?ac=music&lk=lrc&id=${id}`
}