import * as g from './gequbao'
import * as z from './zz123'
import * as t from './2t58'
export * from './common'

export * as Middleware from '../util/middleware'
export * as Env from '../util/env'
export * as Proxy from '../util/proxy'
export * as Clue from '../util/clue'
export * as Config from '../util/config'

export type Adaptor = typeof g.key | typeof z.key | typeof t.key

export const adaptors: Adaptor[] = [
    z.key,
    g.key,
    t.key
]

export function createApiAdaptor(key: Adaptor) {
    switch (key) {
        case g.key:
            return g;
        case z.key:
            return z;
        case t.key:
            return t;
        default:
            break;
    }
}