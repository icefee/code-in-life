import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { getResponse } from '../../adaptors';
import { Api } from '../../util/config';

export default async function handler(_req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const response = await getResponse(`${Api.assetUrl}/assets/poster.webp`);
    const headers = response.headers;
    res.setHeader('Content-Type', headers.get('Content-Type'));
    response.body.pipe(res);
}
