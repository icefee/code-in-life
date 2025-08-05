import fetch, { Response } from 'node-fetch'
import { type Adaptor } from '.'
import { userAgent } from '../util/config'
import { isTextNotNull } from '../util/string'

export * as cheerio from 'cheerio'

export { isTextNotNull, escapeSymbols } from '../util/string'

export { type HeadersInit, Headers } from 'node-fetch'

export const defaultPoster = '/poster.jpg'

export function getResponse(...args: Parameters<typeof fetch>): Promise<Response> {
    return fetch(...args)
}

export async function getJson<T = any>(...args: Parameters<typeof fetch>): Promise<T> {
    return getResponse(...args).then<T>(
        response => response.json()
    )
}

export async function getText(...args: Parameters<typeof fetch>): Promise<string> {
    return getResponse(...args).then(
        response => response.text()
    )
}

export async function getTextWithTimeout(...args: Parameters<typeof fetch>): Promise<string> {
    const [url, init] = args;
    try {
        const text = await getText(url, {
            ...init,
            headers: {
                ...init?.headers,
                'cache-control': 'no-cache',
                'user-agent': userAgent
            },
            timeout: 8e3
        })
        return text
    }
    catch (err) {
        return null
    }
}

export function parseId(id: string) {
    const key = id[0] as Adaptor
    return {
        key,
        id: id.slice(1)
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

export function parseLrcText(text: string): Lrc[] {
    const lines = text.split(/\r?\n/)
    const lrcs = []
    for (const line of lines) {
        const timeMatchReg = /\[\d{1,2}:\d{1,2}\.\d*\]/g
        const timeMatches = line.match(timeMatchReg)
        const text = line.replace(timeMatchReg, '')
        if (timeMatches && isTextNotNull(text)) {
            for (const timeMatch of timeMatches) {
                lrcs.push({
                    time: parseDuration(timeMatch.replace(/(\[|\])/g, '')),
                    text
                })
            }
        }
    }
    return lrcs.sort(
        (prev, next) => prev.time - next.time
    )
}