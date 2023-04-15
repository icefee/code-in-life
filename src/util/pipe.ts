import type { GatsbyFunctionResponse } from 'gatsby';

export function setCommonHeaders(response: GatsbyFunctionResponse) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    return response;
}
