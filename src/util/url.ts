
export function generate(origin: string) {
    const url = new URL(origin);
    url.searchParams.append('ts', `${+new Date}`);
    return url.toString();
}
