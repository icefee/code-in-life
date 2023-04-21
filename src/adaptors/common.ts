import fetch, { Response } from 'node-fetch';
import { type Adaptor } from '.';

export const defaultPoster = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="128" height="128"><path d="M1023.969343 511.946281A511.77753 511.77753 0 1 1 626.119623 12.873428a503.76806 503.76806 0 0 1 82.856588 26.376014 512.329907 512.329907 0 0 1 314.993132 472.696839z" fill="#EA5D5B" p-id="3430"></path><path d="M708.976211 39.249442v472.696839h-82.856588V12.873428a503.76806 503.76806 0 0 1 82.856588 26.376014z" fill="#444" p-id="3431"></path><path d="M511.915624 709.006868a197.060587 197.060587 0 1 1 197.060587-197.060587 197.198681 197.198681 0 0 1-197.060587 197.060587z m0-311.264585a114.203998 114.203998 0 1 0 114.203999 114.203998 114.342093 114.342093 0 0 0-114.203999-114.203998z" fill="#444"></path></svg>`

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
    try {
        const abortController = new AbortController();
        const timeout = setTimeout(() => abortController.abort(), 4e3)
        const text = await getResponse(url, {
            ...init,
            signal: abortController.signal
        }).then(
            response => response.text()
        )
        clearTimeout(timeout);
        return text;
    }
    catch (err) {
        return null;
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

export function parseDuration(time: string) {
    const timeStamp = time.match(/^\d{1,2}:\d{1,2}/)
    const [m, s] = timeStamp[0].split(':')
    const millsMatch = time.match(/\.\d*/)
    const mills = parseFloat(millsMatch[0])
    return toPrecision(parseInt(m) * 60 + parseInt(s) + (Number.isNaN(mills) ? 0 : mills))
}

export function isTextNotNull(text: string) {
    return text.trimStart().trimEnd().length > 0;
}