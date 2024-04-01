function bufferSupported() {
    return 'Buffer' in globalThis
}

export function encode(text: string) {
    if (bufferSupported()) {
        return Buffer.from(text).toString('base64')
    }
    return btoa(text)
}

export function decode(text: string) {
    if (bufferSupported()) {
        return Buffer.from(text, 'base64').toString()
    }
    return atob(text)
}