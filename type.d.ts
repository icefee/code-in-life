declare module '*.module.css'

declare interface SearchVideo {
    key: string;
    name: string;
    rating: number;
    data: VideoListItem[];
    page: ResponsePagination;
}

declare type VideoItem = {
    label: string;
    url: string;
}

declare type VideoSource = {
    name: string;
    urls: VideoItem[]
}

declare type VideoType = {
    tid: string;
    tname: string;
}

declare interface VideoInfo {
    name: string;
    subname?: string;
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

declare interface VideoListItem {
    id: number;
    name: string;
    note: string;
    last: string;
    dt: string;
    tid: number;
    type: string;
}

declare interface ResponsePagination {
    page: number;
    pagecount: number;
    pagesize: number;
    recordcount: number;
}

declare namespace ProxyVideo {

    export interface SearchVideo {
        videoInfoId: number;
        videoTitle: string;
        pageUrl: string;
        createTime: string;
        videoImgUrl: string;
    }

    export interface ParsedVideo {
        id: number;
        poster: string;
        title: string;
        createTime: string;
    }

    export interface SearchResult<T = SearchVideo> {
        data: T[];
        totalPage: number;
        page: number;
    }

    export interface ParsedResult<T = ParsedVideo> extends Pick<SearchResult<T>, 'page'> {
        list: T[];
        total: number;
    }
}

interface ApiJsonSuccess<T = unknown> {
    code: 0;
    data: T;
    msg: string;
}

interface ApiJsonFail {
    code: -1;
    data: null;
    msg: string;
}

declare type ApiJsonType<T = unknown> = ApiJsonSuccess<T> | ApiJsonFail;

declare interface ToastMsg<T = unknown> {
    msg: string;
    type: T;
}

declare interface SearchTask<T = unknown> {
    keyword?: string;
    data: T[];
    pending: boolean;
    complete: boolean;
    success: boolean;
}

declare interface SearchMusic {
    id: string;
    name: string;
    artist: string;
    url: string;
    poster: string;
}
