
export function utf82utf16(source: string) {
    var out, i, len, c;
    var char2, char3;
    out = '';
    len = source.length;
    i = 0;
    while (i < len) {
        c = source.charCodeAt(i++);
        switch (c >> 4) {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                out += source.charAt(i - 1);
                break;
            case 12: case 13:
                char2 = source.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                char2 = source.charCodeAt(i++);
                char3 = source.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }
    return out;
}
