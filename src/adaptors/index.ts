import * as g from './gequbao';
import * as z from './zz123';

export * from './common';

export type Adaptor = typeof g.key | typeof z.key

export const adaptors: Adaptor[] = [
    z.key,
    g.key
]

export function createApiAdaptor(key: Adaptor) {
    switch (key) {
        case g.key:
            return g;
        case z.key:
            return z;
        default:
            break;
    }
}
