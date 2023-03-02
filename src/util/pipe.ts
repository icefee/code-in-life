import type { GatsbyFunctionResponse } from 'gatsby';
import { isDev } from './env';

export function setCommonHeaders(response: GatsbyFunctionResponse) {
    const allowOrigin = isDev ? 'http://localhost:422' : 'https://c.stormkit.dev';
    response.setHeader('Access-Control-Allow-Origin', allowOrigin)
    return response;
}
