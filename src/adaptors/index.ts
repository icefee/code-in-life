import * as g from './gequbao'
import * as z from './zz123'
import * as t from './2t58'

export * from './common';

export type Adaptor = typeof g.key | typeof z.key | typeof t.key

export const adaptors: Adaptor[] = [
    g.key,
    z.key,
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
