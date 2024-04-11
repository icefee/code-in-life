import { isDev } from './env'

export abstract class Api {
    public static netlifyDomain = 'netlify.app'
    public static site = `http://cik.${Api.netlifyDomain}`
    public static assetSite = 'https://spacedeta-4-f1000878.deta.app'
    public static proxyServer = isDev ? '' : (process.env.POSTER_SERVER || `https://music-online.${Api.netlifyDomain}`)
}

export const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
