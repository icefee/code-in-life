import type { GatsbyFunctionResponse } from 'gatsby';
import { isDev } from './env';
import { Api } from './config';

export function setCommonHeaders(response: GatsbyFunctionResponse) {
    const allowOrigin = isDev ? 'http://localhost:422' : Api.assetUrl;
    response.setHeader('Access-Control-Allow-Origin', allowOrigin)
    return response;
}
