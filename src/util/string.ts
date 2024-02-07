
export function isTextNotNull(text: string) {
    return /[^\s\r\n]+/.test(text);
}

const htmlSymbolEntries: [string, string][] = [
    ['&nbsp;', ' '],
    ['&lt;', '<'],
    ['&gt;', '>'],
    ['&quot;', '"'],
    ['&apos;', '\''],
    ['&amp;', '&']
]

function escapeDecimalHtmlSymbols(source: string) {
    return source.replace(/&#\d+;/g, (match) => {
        const matchCode = match.match(/\d+/)
        if (matchCode) {
            return String.fromCharCode(+matchCode[0])
        }
        return match
    })
}

export function escapeSymbols(source: string) {
    if (source) {
        return htmlSymbolEntries.reduce(
            (text, [s, d]) => text.replaceAll(s, d),
            escapeDecimalHtmlSymbols(source)
        )
    }
    return ''
}
