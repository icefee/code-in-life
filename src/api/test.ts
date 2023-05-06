import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {

    let msg = 'hello';

    res.json({
        msg,
    })
}