declare module '*.module.css'

declare interface SourceType {
    key: string;
    name: string;
    rating: number;
}

declare interface DataSource extends SourceType {
    group: string;
}

declare interface SearchVideo extends SourceType {
    data: VideoListItem[];
    page: ResponsePagination;
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

declare type VideoItem = {
    label: string;
    url: string;
}

declare type VideoSource = {
    name: string;
    urls: VideoItem[];
}

declare type VideoType = {
    tid: string;
    tname: string;
}

declare interface VideoInfo {
    id: number;
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
    proxy: boolean;
    prefer: boolean;
    dataList: VideoSource[];
    related: VideoRelated[];
}

declare interface VideoRelated extends Pick<VideoInfo, 'name' | 'note' | 'last'> {
    id: string;
}

declare interface ResponsePagination {
    page: number;
    pagecount: number;
    pagesize: number;
    recordcount: number;
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

declare interface Lrc {
    time: number;
    text: string;
}