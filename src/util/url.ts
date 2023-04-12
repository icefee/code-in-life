
export function generate(origin: string) {
    const params = `${+new Date}`;
    if (origin.startsWith('http')) {
        const url = new URL(origin);
        url.searchParams.append('ts', params);
        return url.toString();
    }
    else {
        return origin + (origin.match(/\?\w*=/) ? '&' : '?') + `ts=${params}`;
    }
}
