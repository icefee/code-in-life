import { isDev } from './env'

export abstract class MapConfig {
    public static ak = 'HtZHMbtfCjuk6XAzadTI6uB5X9ORdS4H'
}

export abstract class Api {
    private static localhost = '127.0.0.1'
    public static site = isDev ? `http://${Api.localhost}:420` : 'http://cik.netlify.app'
    public static assetSite = 'https://cil.onrender.com'
    public static hosting = isDev ? `http://${Api.localhost}:8000` : 'https://apps.gatsbyjs.io'
    public static assetUrl = 'https://www.stormkit.dev'
    public static posterApiPrefix = isDev ? '' : 'https://music.gatsbyjs.io'
}
