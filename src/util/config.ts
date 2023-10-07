import { isDev } from './env'

export abstract class Api {
    public static proxyServer = isDev ? '' : (process.env.POSTER_Server ?? 'https://code-app.netlify.app')
    public static assetSite = 'https://spacedeta-5-f1000878.deta.app'
}

export const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.121 Safari/537.36 AVG/112.0.20879.122'