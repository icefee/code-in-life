import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { Api } from '../../util/config';
import { SearchMusic } from '../../components/player/MusicPlayer';

async function getMusicSearch(s: string): Promise<SearchMusic[]> {
    const url = `${Api.music}/s/${s}`;
    try {
        const html = await fetch(url).then(
            response => response.text()
        )
        const matchBlocks = html.replace(/[\n\s\r]+/g, '').replace(new RegExp('&amp;', 'g'), '&').match(
            /<tr><td><ahref="\/music\/\d+"class="text-primaryfont-weight-bold"target="_blank">[^<]+<\/a><\/td><tdclass="text-success">[^<]+<\/td><td><ahref="\/music\/\d+"target="_blank"><u>下载<\/u><\/a><\/td><\/tr>/g
        )
        if (matchBlocks) {
            return matchBlocks.map(
                (block) => {
                    const url = block.match(/music\/\d+/)[0]
                    const id = url.match(/\d+/)
                    const nameBlock = block.match(/(?<=<ahref="\/music\/\d+"class="text-primaryfont-weight-bold"target="_blank">)[^<]+(?=<\/a>)/)
                    const artistBlock = block.match(/(?<=<tdclass="text-success">)[^<]+(?=<\/td>)/)
                    return {
                        id: parseInt(id[0]),
                        name: nameBlock[0],
                        artist: artistBlock[0]
                    }
                }
            )
        }
        return [];
    }
    catch (err) {
        return null;
    }
}

export default async function handler(req: GatsbyFunctionRequest, res: GatsbyFunctionResponse): Promise<void> {
    const { s } = req.query;
    const list = await getMusicSearch(s)
    if (list) {
        res.json({
            code: 0,
            data: list,
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
