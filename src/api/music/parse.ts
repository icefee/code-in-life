import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { Api } from '../../util/config';

async function getMusicUrl(id: string) {
    const url = `${Api.music}/music/${id}`
    try {
        const html = await fetch(url).then(
            response => response.text()
        )
        const matchBlock = html.match(
            /const url = 'https?:\/\/[^']+'/
        )
        return matchBlock[0].match(/https?:\/\/[^']+/)[0].replace(new RegExp('&amp;', 'g'), '&')
    }
    catch (err) {
        return null
    }
}

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { id } = req.query;
    const url = await getMusicUrl(id)
    if (url) {
        res.json({
            code: 0,
            data: url,
            msg: '成功'
        })
    }
    else {
        res.json({
            code: -1,
            data: null,
            msg: '失败'
        })
    }
}
