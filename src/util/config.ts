import { isDev } from './env'

export abstract class Api {
    private static localhost = '127.0.0.1'
    public static hosting = isDev ? `http://${Api.localhost}:8000` : 'https://music.gatsbyjs.io'
    public static posterApiPrefix = isDev ? '' : 'https://apps.gatsbyjs.io'
    public static assetSite = 'https://spacedeta-5-f1000878.deta.app'
}
