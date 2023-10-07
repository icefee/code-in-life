import { isDev } from './env'

export abstract class Api {
    private static localhost = '127.0.0.1'
    public static gatsbyDomain = 'gatsbyjs.io'
    public static hosting = isDev ? `http://${Api.localhost}:8000` : `https://music.${Api.gatsbyDomain}`
    public static posterApiPrefix = isDev ? '' : `https://apps.${Api.gatsbyDomain}`
    public static proxyServer = isDev ? '' : `https://code-app.netlify.app`
    public static assetSite = 'https://spacedeta-5-f1000878.deta.app'
}

export const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.121 Safari/537.36 AVG/112.0.20879.122'