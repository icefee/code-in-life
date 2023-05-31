
type VideoClue = {
    api: string;
    id: string | number;
}

export default abstract class Clue {

    public static parse(text: string): VideoClue | null {
        try {
            const origin = atob(text + '='.repeat(4 - text.length % 4));
            const [api, id] = origin.split('|');
            return {
                api,
                id
            }
        }
        catch (err) {
            return null;
        }
    }

    public static create(api: VideoClue['api'], id: VideoClue['id']): string {
        return btoa(`${api}|${id}`).replace(/\={1,2}$/, '')
    }
}
