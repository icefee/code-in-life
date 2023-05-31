
function bufferSupported() {
    return 'Buffer' in globalThis;
}

export function utf8Tobase64(text: string) {
    if (bufferSupported()) {
        return Buffer.from(text).toString('base64')
    }
    return btoa(text)
}

export function base64ToUtf8(text: string) {
    if (bufferSupported()) {
        return Buffer.from(text, 'base64').toString()
    }
    return atob(text)
}
