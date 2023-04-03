import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { Api } from '../../../util/config';

function toPrecision(n: number) {
    return Math.round((n * 100)) / 100;
}

function parseDuration(time: string) {
    const timeStamp = time.match(/^\d{1,2}:\d{1,2}/)
    const [m, s] = timeStamp[0].split(':')
    const millsMatch = time.match(/\.\d*/)
    const mills = parseFloat(millsMatch[0])
    return toPrecision(parseInt(m) * 60 + parseInt(s) + (Number.isNaN(mills) ? 0 : mills))
}

async function parseLrc(id: string) {
    try {
        const lrc = await fetch(`${Api.music}/download/lrc/${id}`).then(
            response => response.text()
        )
        const lines = lrc.split(/\n/).filter(
            s => s.trim().length > 0
        ).map(
            line => {
                const timeMatch = line.match(/\d{1,2}:\d{1,2}\.\d*/)
                const textMatch = line.match(/(?<=]).+(?=($|\r))/)
                return {
                    time: parseDuration(timeMatch[0]),
                    text: textMatch ? textMatch[0] : ''
                }
            }
        )
        return lines;
    }
    catch (err) {
        return null;
    }
}

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { id } = req.params;
    const lrc = await parseLrc(id);
    if (lrc) {
        res.json({
            code: 0,
            data: lrc,
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
