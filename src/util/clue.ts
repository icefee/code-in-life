import { encode, decode } from './base64'

type EncodedClue = {
    api: string;
    id: string | number;
}

export abstract class Base64Params {

    public static parse(text: string): string | null {
        try {
            return decode(text + '='.repeat(4 - text.length % 4))
        }
        catch (err) {
            return null
        }
    }

    public static create(text: string): string {
        return encode(text).replace(/\={1,2}$/, '')
    }
}

export abstract class Clue {

    public static parse(text: string): EncodedClue | null {
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

    public static create(api: EncodedClue['api'], id: EncodedClue['id']): string {
        return Base64Params.create(`${api}|${id}`)
    }
}
