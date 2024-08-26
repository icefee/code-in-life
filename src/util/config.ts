import { isDev } from './env'

export abstract class Api {
    public static posterServer = isDev ? '' : (process.env.POSTER_SERVER ?? 'https://code-app.netlify.app')
    public static proxyUrl = 'https://astro-app-7d4.pages.dev'
}

export const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'