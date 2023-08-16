import { isDev } from './env'

export abstract class Api {
    private static localhost = '127.0.0.1'
    public static site = isDev ? `http://${Api.localhost}:420` : 'http://cik.netlify.app'
    public static gatsbyDomain = 'gatsbyjs.io'
    public static assetSite = 'https://cil.onrender.com'
    public static hostDomain = `https://apps.${Api.gatsbyDomain}`
    public static posterApiPrefix = isDev ? '' : (process.env.POSTER_ORIGIN || `https://music.${Api.gatsbyDomain}`)
}
