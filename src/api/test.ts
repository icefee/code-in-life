import { Middleware } from '../adaptors'
// import { open } from 'lmdb';

const handler: Middleware.ApiHandler = async (req, res) => {

    let msg = 'hello';

    const { env } = req.query

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
        env: env ? process.env[env] : null
    })
}

export default Middleware.errorHandler(handler)