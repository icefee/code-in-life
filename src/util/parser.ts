import { type Response } from 'node-fetch'

export type DataParser<P = unknown> = <T extends any = P>(response: Response) => Promise<T> | T;

export async function jsonBase64<T extends any>(response: Response) {
    const text = await response.text()
    const matchedBase64 = text.match(/[a-zA-Z\d\/\+\=]{100,}/g)
    if (!matchedBase64 && isNextResult(text)) {
        return null;
    }
    return matchedBase64 ? JSON.parse(Buffer.from(matchedBase64[0], 'base64').toString('utf-8')) as T : null;
}

export async function image(response: Response) {
    const text = await response.text()
    const matchedImage = text.match(/https?:\/\/.+?\.((jpe?|pn)g|webp)/g)
    if (matchedImage) {
        return matchedImage[0]
    }
    return null;
}

function isNextResult(html: string) {
    const nextScriptMeta = /<script id=\"__NEXT_DATA__\" type=\"application\/json\">/
    return nextScriptMeta.test(html);
}

export function utf82utf16(source: string) {
    var out, i, len, c;
    var char2, char3;
    out = '';
    len = source.length;
    i = 0;
    while (i < len) {
        c = source.charCodeAt(i++);
        switch (c >> 4) {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                out += source.charAt(i - 1);
                break;
            case 12: case 13:
                char2 = source.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                char2 = source.charCodeAt(i++);
                char3 = source.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }
    return out;
}

export function utf162utf8(source: string) {
    var out, i, len, c;
    out = "";
    len = source.length;
    for (i = 0; i < len; i++) {
        c = source.charCodeAt(i);
        if ((c >= 0x0001) && (c <= 0x007F)) {
            out += source.charAt(i);
        } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        } else {
            out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        }
    }
    return out;
}

export function toBase64(source: string): string {
    return btoa(source);
}

/*
declare global {
    interface Array<T> {
        shuffle(this: T[]): T[];
    }
}

Array.prototype.shuffle = function() {
    return this.sort(() => Math.random() - .5)
}
*/