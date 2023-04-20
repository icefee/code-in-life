import * as g from './gequbao';

export * from './common';

export type Adaptor = typeof g.key

export const adaptors: Adaptor[] = [
    g.key
]

export function createApiAdaptor(key: Adaptor) {
    switch (key) {
        case g.key:
            return g;
        default:
            break;
    }
}
