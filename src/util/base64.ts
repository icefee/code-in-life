function bufferSupported() {
    return 'Buffer' in globalThis
}

export function encode(text: string) {
    if (bufferSupported()) {
        return Buffer.from(text).toString('base64')
    }
    try {
        return btoa(text)
    }
    catch (err) {
        const encoded = encodeURIComponent(text)
        return btoa(encoded)
    }
}

export function decode(text: string) {
    if (bufferSupported()) {
        return Buffer.from(text, 'base64').toString()
    }
    return atob(text)
}