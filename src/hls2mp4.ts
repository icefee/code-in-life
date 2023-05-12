import { createFFmpeg, fetchFile, CreateFFmpegOptions, FFmpeg } from '@ffmpeg/ffmpeg';

export enum TaskType {
    loadFFmeg = 0,
    parseM3u8 = 1,
    downloadTs = 2,
    mergeTs = 3
}

interface ProgressCallback {
    (type: TaskType, progress: number): void
}

type LoadResult<T = unknown> = {
    done: boolean;
    data: T;
    msg?: string;
}

type Hls2Mp4Options = {
    maxRetry?: number;
}

export interface M3u8Parsed {
    url: string;
    content: string;
}

export function createFileUrlRegExp(ext: string, flags?: string) {
    return new RegExp('(https?://)?[\\w:\\.\\-\\/]+?\\.' + ext, flags)
}

function parseUrl(url: string, path: string) {
    if (path.startsWith('http')) {
        return path;
    }
    return new URL(path, url).href;
}

export async function parseM3u8File(url: string, customFetch?: (url: string) => Promise<string>): Promise<M3u8Parsed> {
    let playList = '';
    if (customFetch) {
        playList = await customFetch(url)
    }
    else {
        playList = await fetchFile(url).then(
            data => new Blob([data.buffer]).text()
        )
    }
    const matchedM3u8 = playList.match(
        createFileUrlRegExp('m3u8', 'i')
    )
    if (matchedM3u8) {
        const parsedUrl = parseUrl(url, matchedM3u8[0])
        return parseM3u8File(parsedUrl, customFetch)
    }
    return {
        url,
        content: playList
    }
}

export default class Hls2Mp4 {

    private instance: FFmpeg;
    private maxRetry: number;
    private loadRetryTime = 0;
    public onProgress?: ProgressCallback;

    constructor({ maxRetry = 3, ...options }: CreateFFmpegOptions & Hls2Mp4Options, onProgress?: ProgressCallback) {
        this.instance = createFFmpeg(options);
        this.maxRetry = maxRetry;
        this.onProgress = onProgress;
    }

    private transformBuffer(buffer: Uint8Array) {
        if (buffer[0] === 0x47) {
            return buffer;
        }
        let bufferOffset = 0;
        for (let i = 0; i < buffer.length; i++) {

            if (buffer[i] === 0x47 && buffer[i + 1] === 0x40) {
                bufferOffset = i;
                break;
            }
        }
        return buffer.slice(bufferOffset)
    }

    private async parseM3u8(url: string) {
        this.onProgress?.(TaskType.parseM3u8, 0)
        const { done, data } = await this.loopLoadFile<M3u8Parsed>(
            () => parseM3u8File(url)
        )
        if (done) {
            this.onProgress?.(TaskType.parseM3u8, 1)
            return data;
        }
        new Error('m3u8 load failed')
    }

    private async downloadTs(url: string) {
        const { done, data } = await this.loopLoadFile<Uint8Array>(
            () => fetchFile(url)
        )
        if (done) {
            return data;
        }
        throw new Error('ts download failed')
    }

    private async downloadSegments() {}

    private async downloadM3u8(url: string) {
        let { content, url: parsedUrl } = await this.parseM3u8(url)
        const keyMatch = content.match(
            createFileUrlRegExp('key', 'i')
        )
        if (keyMatch) {
            throw new Error('video encrypted did not supported for now')
            /*
            const key = keyMatch[0]
            const keyUrl = parseUrl(parsedUrl, key)
            const keyName = 'key.key'
            this.instance.FS('writeFile', keyName, await fetchFile(keyUrl))
            content = content.replace(key, keyName)
            */
        }
        const segs = content.match(
            createFileUrlRegExp('ts', 'gi')
        )
        for (let i = 0; i < segs.length; i++) {
            const tsUrl = parseUrl(parsedUrl, segs[i])
            const segName = `seg-${i}.ts`
            const tsData = await this.downloadTs(tsUrl)
            const buffer = this.transformBuffer(tsData)
            this.instance.FS('writeFile', segName, buffer)
            this.onProgress?.(TaskType.downloadTs, (i + 1) / segs.length)
            content = content.replace(segs[i], segName)
        }
        const m3u8 = 'temp.m3u8'
        this.instance.FS('writeFile', m3u8, content)
        return m3u8
    }

    private async loopLoadFile<T = undefined>(startLoad: () => PromiseLike<T | undefined>): Promise<LoadResult<T>> {
        try {
            const result = await startLoad();
            this.loadRetryTime = 0;
            return {
                done: true,
                data: result
            }
        }
        catch (err) {
            this.loadRetryTime += 1;
            if (this.loadRetryTime < this.maxRetry) {
                return this.loopLoadFile<T>(startLoad)
            }
            return {
                done: false,
                data: null
            }
        }
    }

    private async loadFFmpeg() {
        this.onProgress?.(TaskType.loadFFmeg, 0)
        const { done } = await this.loopLoadFile(
            () => this.instance.load()
        )
        if (done) {
            this.onProgress?.(TaskType.loadFFmeg, done ? 1 : -1);
        }
        else {
            throw new Error('FFmpeg load failed')
        }
    }

    public async download(url: string) {
        await this.loadFFmpeg();
        const m3u8 = await this.downloadM3u8(url);
        this.onProgress?.(TaskType.mergeTs, 0);
        await this.instance.run('-i', m3u8, '-c', 'copy', 'temp.mp4', '-loglevel', 'debug');
        const data = this.instance.FS('readFile', 'temp.mp4');
        this.instance.exit();
        this.onProgress?.(TaskType.mergeTs, 1);
        return data.buffer;
    }

    public saveToFile(buffer: ArrayBufferLike, filename: string) {
        const objectUrl = URL.createObjectURL(new Blob([buffer], { type: 'video/mp4' }));
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = filename;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
    }
}
