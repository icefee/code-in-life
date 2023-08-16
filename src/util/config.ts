import { isDev } from './env'

export abstract class Api {
    private static localhost = '127.0.0.1'
    public static site = isDev ? `http://${Api.localhost}:420` : 'http://cik.netlify.app'
    public static assetSite = 'https://cil.onrender.com'
    public static hostDomain = 'https://apps.gatsbyjs.io'
    public static posterApiPrefix = isDev ? '' : (process.env.POSTER_ORIGIN || 'https://music.gatsbyjs.io')
}
