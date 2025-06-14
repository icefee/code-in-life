export abstract class Api {
    public static site = 'http://cik.netlify.app'
    public static assetSite = 'https://app-center.netlify.app'
    public static proxyUrl = 'https://astro-app-7d4.pages.dev'
    public static posterServer = process.env.POSTER_SERVER || ''
}

export const maxChunkSize = Math.pow(2, 20) * 4 // 4mb

export const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'