import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { createApiAdaptor, defaultPoster, parseId } from '../../../adaptors';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { id: paramId } = req.params;
    const { key, id } = parseId(paramId);
    const adaptor = createApiAdaptor(key)
    const poster = await adaptor.parsePoster(id);
    try {
        if (poster) {
            res.writeHead(301, {
                'location': poster
            })
            res.end()
        }
        else {
            throw new Error('can not find poster')
        }
    }
    catch (err) {
        res.setHeader('Content-Type', 'image/svg+xml')
        res.send(defaultPoster)
    }
}
