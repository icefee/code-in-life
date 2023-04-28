
export function isTextNotNull(text: string) {
    return /[^\s\r\n]+/.test(text);
}
