import { M3u8 } from '../../util/RegExp';

export interface SearchVideo {
    key: string;
    name: string;
    rating: number;
    data: VideoListItem[];
    page: ResponsePagination;
}

export type VideoItem = {
    label: string;
    url: string;
}

export type VideoSource = {
    name: string;
    urls: VideoItem[]
}

export type VideoType = {
    tid: string;
    tname: string;
}

export interface VideoInfo {
    name: string;
    note: string;
    pic: string;
    type: string;
    year: string;
    actor?: string;
    area?: string;
    des: string;
    director?: string;
    lang: string;
    last: string;
    state: number;
    tid: number;
    dataList: VideoSource[]
}

export interface VideoListItem {
    id: number;
    name: string;
    note: string;
    last: string;
    dt: string;
    tid: number;
    type: string;
}

export interface ResponsePagination {
    page: number;
    pagecount: number;
    pagesize: number;
    recordcount: number;
}

export async function getM3u8Url(url: string) {
    try {
        const html = await fetch(url).then(
            response => response.text()
        );
        const matchedUrls = html.match(M3u8.match);
        if (matchedUrls) {
            const parsedUrl = matchedUrls[0];
            if (parsedUrl.startsWith('http')) {
                return parsedUrl;
            }
            const uri = new URL(url);
            if (parsedUrl.startsWith('/')) {
                return uri.origin + parsedUrl;
            }
            const paths = uri.pathname.split('/');
            paths.pop();
            return uri.origin + paths.join('/') + '/' + parsedUrl;
        }
        else {
            throw new Error('😥 not matched.')
        }
    }
    catch (err) {
        console.log('💔 req failed')
        return null;
    }
}
