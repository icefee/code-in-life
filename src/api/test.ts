import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
// import { open } from 'lmdb';

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {

    let msg = 'hello';

    /*
    const db = open({
        path: 'test-db',
        compression: true
    })

    const testValue = db.get('test-value')

    if (testValue) {
        msg = testValue
    }
    else {
        await db.put('test-value', new Date().toDateString())
    }
    */

    res.json({
        msg,
    })
}