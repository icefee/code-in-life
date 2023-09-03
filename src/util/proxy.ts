import { Api } from './config'

export function proxyUrl(url: string, remote: boolean = false, extend = {}) {
    const searchParams = new URLSearchParams({
        url,
        ...extend
    })
    return `${remote ? Api.assetSite : ''}/api/proxy?${searchParams}`
}
