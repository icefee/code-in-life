import { utf8ToBase64, base64ToUtf8 } from './base64'

type VideoClue = {
    api: string;
    id: string | number;
}

export abstract class Base64Params {

    public static parse(text: string): string | null {
        try {
            return base64ToUtf8(text + '='.repeat(4 - text.length % 4))
        }
        catch (err) {
            return null
        }
    }

    public static create(text: string): string {
        return utf8ToBase64(text).replace(/\={1,2}$/, '')
    }
}

export abstract class Clue {

    public static parse(text: string): VideoClue | null {
        const origin = Base64Params.parse(text)
        if (origin !== null) {
            const [api, id] = origin.split('|')
            return {
                api,
                id
            }
        }
        return null
    }

    public static create(api: VideoClue['api'], id: VideoClue['id']): string {
        return Base64Params.create(`${api}|${id}`)
    }
}
