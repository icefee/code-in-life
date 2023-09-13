import { isDev } from './env'

export abstract class Api {
    private static localhost = '127.0.0.1'
    public static netlifyDomain = 'netlify.app'
    public static site = isDev ? `http://${Api.localhost}:420` : `http://cik.${Api.netlifyDomain}`
    public static gatsbyDomain = 'gatsbyjs.io'
    public static assetSite = 'https://spacedeta-5-f1000878.deta.app'
    public static hostDomain = `https://apps.${Api.gatsbyDomain}`
    public static proxyServer = isDev ? '' : `https://code-app.${Api.netlifyDomain}`
    public static posterApiPrefix = isDev ? '' : (process.env.POSTER_ORIGIN || `https://music.${Api.gatsbyDomain}`)
}

export const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.121 Safari/537.36 AVG/112.0.20879.122'
