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
