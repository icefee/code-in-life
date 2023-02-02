export type VideoItem = {
    label: string;
    url: string;
}

export type VideoSource = {
    name: string;
    urls: VideoItem[]
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
