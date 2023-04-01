import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { Api } from '../../util/config';
import { SearchMusic } from '../../components/player/MusicPlayer';
import { setCommonHeaders } from '../../util/pipe';

async function getMusicSearch(s: string): Promise<SearchMusic[]> {
    const url = `${Api.music}/s/${s}`;
    try {
        const html = await fetch(url).then(
            response => response.text()
        )
        const matchBlocks = html.replace(/[\n\r]+/g, '').replace(new RegExp('&amp;', 'g'), '&').match(
            /<tr>\s*<td><a href="\/music\/\d+"\s*class="text-primary font-weight-bold"\s+target="_blank">[^<]+<\/a>\s*<\/td>\s*<td class="text-success">[^<]+<\/td>\s*<td><a href="\/music\/\d+" target="_blank"><u>下载<\/u><\/a><\/td>\s*<\/tr>/g
        )
        if (matchBlocks) {
            return matchBlocks.map(
                (block) => {
                    const url = block.match(/music\/\d+/)[0]
                    const idBlock = url.match(/\d+/)
                    const nameBlock = block.match(/(?<=<a href="\/music\/\d+"\s*class="text-primary font-weight-bold" target="_blank">)[^<]+(?=<\/a>)/)
                    const artistBlock = block.match(/(?<=<td class="text-success">)[^<]+(?=<\/td>)/)
                    const id = parseInt(idBlock[0])
                    return {
                        id,
                        name: nameBlock[0].trimStart().trimEnd(),
                        artist: artistBlock[0],
                        poster: `${Api.hosting}/api/music/poster?id=${id}`
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
    setCommonHeaders(res)
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
