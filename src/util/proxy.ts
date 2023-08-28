import { Api } from './config'

export function proxyUrl(url: string, remote: boolean = false) {
    const searchParams = new URLSearchParams({
        url
    })
    return `${remote ? Api.assetSite : ''}/api/proxy?${searchParams}`
}
