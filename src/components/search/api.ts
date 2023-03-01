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
