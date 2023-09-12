import { Api } from './config'

export function getParamsUrl(url: string, params: Record<string, string>) {
    const urlSearchParams = new URLSearchParams(params)
    return `${url}?${urlSearchParams}`
}

export function proxyUrl(url: string, remote: boolean = false, extend = {}) {
    return getParamsUrl(`${remote ? Api.assetSite : ''}/api/proxy`, {
        url,
        ...extend
    })
}

export function removeAds(content: string, mark: string) {
    const discontinuityTag = /#EXT-X-DISCONTINUITY/
    const infReg = new RegExp('#EXTINF:\\d+(.\\d+)?,')
    const lines = content.split(/\n/)
    const parts = []
    let extLine = false
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (line.match(discontinuityTag)) {
            continue;
        }
        if (extLine && line.indexOf(mark) !== -1) {
            parts.pop()
        }
        else {
            parts.push(line)
        }
        extLine = Boolean(line.match(infReg))
    }
    return parts.join('\n')
}
