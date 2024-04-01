import { ApiHandler } from '../../../util/middleware'
import { Api } from '../../../util/config'

const handler: ApiHandler = async (req, res) => {
    const { token } = req.params
    res.redirect(`${Api.assetSite}/api/video/hls/pure/${token}.m3u8?cors=1`)
}

export default handler