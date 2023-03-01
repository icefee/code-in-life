import { isDev } from './env'

export abstract class MapConfig {
    public static ak = 'HtZHMbtfCjuk6XAzadTI6uB5X9ORdS4H'
}

export abstract class Api {
    public static site = isDev ? 'http://localhost:420' : 'http://code-in-life.netlify.app'
    public static assetSite = 'https://code-in-life.onrender.com'
    public static music = 'https://www.gequbao.com'
    public static staticAsset = 'https://c.stormkit.dev'
}
