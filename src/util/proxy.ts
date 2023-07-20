
export function proxyUrl(url: string) {
    const searchParams = new URLSearchParams({
        url
    })
    return `/api/proxy?${searchParams}`
}
