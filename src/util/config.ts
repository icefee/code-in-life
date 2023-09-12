import { isDev } from './env'

export abstract class Api {
    private static localhost = '127.0.0.1'
    public static gatsbyDomain = 'gatsbyjs.io'
    public static hosting = isDev ? `http://${Api.localhost}:8000` : `https://music.${Api.gatsbyDomain}`
    public static posterApiPrefix = isDev ? '' : `https://apps.${Api.gatsbyDomain}`
    public static proxyServer = isDev ? '' : `https://code-app.netlify.app`
    public static assetSite = 'https://spacedeta-5-f1000878.deta.app'
}
