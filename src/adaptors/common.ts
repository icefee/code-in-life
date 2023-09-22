import fetch, { Response } from 'node-fetch';
import AbortController from 'abort-controller';
import { type Adaptor } from '.';
import { isTextNotNull } from '../util/string'
export { type HeadersInit, Headers } from 'node-fetch'

export const defaultPoster = './poster.jpg'

export function getResponse(...args: Parameters<typeof fetch>): Promise<Response> {
    return fetch(...args)
}

export async function getText(...args: Parameters<typeof fetch>): Promise<string> {
    return getResponse(...args).then(
        response => response.text()
    )
}

export async function getTextWithTimeout(...args: Parameters<typeof fetch>): Promise<string> {
    const [url, init] = args;
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 5e3);
    try {
        const text = await getText(url, {
            ...init,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.121 Safari/537.36'
            },
            signal: abortController.signal
        })
        return text;
    }
    catch (err) {
        return null;
    } finally {
        clearTimeout(timeout);
    }
}

export function parseId(id: string) {
    const key = id[0] as Adaptor;
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

export function parseLrcText(text: string) {
    const lines = text.split(/\r?\n/)
    const lrcs = []
    for (const line of lines) {
        const timeMatchReg = /\[\d{1,2}:\d{1,2}\.\d*\]/g
        const timeMatchs = line.match(timeMatchReg)
        const text = line.replace(timeMatchReg, '')
        if (timeMatchs && isTextNotNull(text)) {
            for (const timeMatch of timeMatchs) {
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
