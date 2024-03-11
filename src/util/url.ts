export function generate(origin: string) {
    const params = `${+new Date}`
    const paramKey = '__ts'
    if (origin.startsWith('http')) {
        const url = new URL(origin)
        url.searchParams.append(paramKey, params)
        return url.toString()
    }
    else {
        return origin + (origin.match(/\?\w*=/) ? '&' : '?') + `${paramKey}=${params}`
    }
}