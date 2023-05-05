import { isDev } from './env'

export abstract class Api {
    private static localhost = '127.0.0.1'
    public static hosting = isDev ? `http://${Api.localhost}:8000` : 'https://music.gatsbyjs.io'
}
