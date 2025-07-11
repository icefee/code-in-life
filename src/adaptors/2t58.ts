import { getResponse, getText, parseLrcText, escapeSymbols, Headers } from './common'
import { timeFormatter } from '../util/date'
import { userAgent, Api } from '../util/config'

export const key = 't'

export const baseUrl = 'http://2t58.com'

const getSafeResponse: typeof getResponse = async (url, init) => {
    const response = await getResponse(url, init)
    if (response.status === 403) {
        const [cookie] = response.headers.get('set-cookie').split(';')
        const headers = new Headers(init?.headers)
        headers.set('cookie', cookie)
        return getResponse(url, {
            ...init,
            headers
        })
    }
    return response
}

const getSafeText: typeof getText = async (...args) => {
    const response = await getSafeResponse(...args)
    return response.text()
}

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
                    poster: `${Api.posterServer}/api/music/poster/${id}`
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
        const html = await getSafeText(url)
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
        const result = await getSafeResponse(`${baseUrl}/js/play.php`, {
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

const getLrcUrl = (id: string) => `${baseUrl}/plug/down.php?ac=music&lk=lrc&id=${id}`

export async function parseLrc(id: string) {
    try {
        const lrc = await getSafeText(getLrcUrl(id))
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
    const lrc = await parseLrc(id)
    return lrc?.map(
        ({ time, text }) => {
            const seconds = Math.floor(time)
            return `[${timeFormatter(seconds)}:${Math.round((time - seconds) * 1000)}]${text}`
        }
    ).join('\n')
}