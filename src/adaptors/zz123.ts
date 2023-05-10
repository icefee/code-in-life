import { getResponse, parseDuration, isTextNotNull, getTextWithTimeout } from './common';
import { timeFormatter } from '../util/date';
import { utf82utf16 } from '../util/parser';

export const key = 'z';

export const baseUrl = 'https://zz123.com';

export const posterReferer = true;

export const lrcFile = false;

export async function getMusicSearch(s: string): Promise<SearchMusic[]> {
    const searchParams = new URLSearchParams({
        key: s
    })
    const url = `${baseUrl}/search/?${searchParams}`;
    try {
        const html = await getTextWithTimeout(url)
        const matchBlocks = html.replace(/[\n\r]+/g, '').match(
            /<div class="songname text-ellipsis color-link-content-primary">\s*<a href="\/play\/\w+\.htm" title="[^"]+" data-pjax="">[^<]+<\/a>\s*<\/div>\s*<div class="singername text-ellipsis color-link-content-secondary">\s*<a href="\/singer\/\w+\.htm" title="[^"]+" data-pjax="">[^"]+<\/a>\s*<\/div>/g
        )
        if (matchBlocks) {
            return matchBlocks.map(
                (block) => {
                    const url = block.match(/\/play\/\w+\.htm/)[0]
                    const idMatch = url.match(/(?<=\/play\/)\w+(?=\.htm)/)[0]
                    const nameMatch = block.match(/(?<=<div class="songname text-ellipsis color-link-content-primary">\s*<a href="\/play\/\w+\.htm" title=")[^"]+(?=")/)[0]
                    const artistMatch = block.match(/(?<=<div class="singername text-ellipsis color-link-content-secondary">\s*<a href="\/singer\/\w+\.htm" title=")[^"]+(?=")/)[0]
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
    const { status, data } = await getResponse(`${baseUrl}/ajax/`, {
        method: 'POST',
        body: new URLSearchParams({
            act: 'songinfo',
            id,
            lang: ''
        }),
        headers: {
            'Referer': baseUrl
        }
    }).then<MusicParseApiJson<MusicInfo>>(
        response => response.json()
    )
    if (status === 200) {
        return data;
    }
    return null;
}

export async function parsePoster(id: string) {
    try {
        const info = await getMusicInfo(id);
        return info?.pic;
    }
    catch (err) {
        return null
    }
}


export async function parseMusicUrl(id: string) {
    try {
        const info = await getMusicInfo(id);
        const url = info?.mp3;
        if (url.startsWith('http')) {
            return url;
        }
        const fullUrl = baseUrl + url;
        if (fullUrl.match(/xplay/)) {
            const response = await getResponse(fullUrl, {
                redirect: 'manual'
            })
            const audioUrl = response.headers.get('location');
            return utf82utf16(decodeURI(audioUrl));
        }
        return fullUrl;
    }
    catch (err) {
        return null
    }
}

export async function parseLrc(id: string) {
    try {
        const info = await getMusicInfo(id);
        const lines = info.lrc.split(/\r?\n/);
        const lrcs = [];
        for (const line of lines) {
            const timeMatchReg = /\[\d{1,2}:\d{1,2}\.\d*\]/g;
            const timeMatchs = line.match(timeMatchReg)
            const text = line.replace(timeMatchReg, '')
            if (timeMatchs) {
                for (const timeMatch of timeMatchs) {
                    lrcs.push({
                        time: parseDuration(timeMatch.replace(/(\[|\])/g, '')),
                        text
                    })
                }
            }
        }
        return lrcs.filter(
            ({ text }) => {
                const hostname = new URL(baseUrl).hostname;
                return isTextNotNull(text) && !text.match(new RegExp(hostname));
            }
        ).sort(
            (prev, next) => prev.time - next.time
        )
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
