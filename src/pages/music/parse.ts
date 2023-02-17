import React from 'react';
import type { GetServerDataProps, PageProps } from 'gatsby';
import { Api } from '../../util/config';

interface ParserProps {
    url: string;
}

const Parser: React.FC<PageProps<object, object, unknown, ParserProps>> = ({ serverData }) => React.createElement(React.Fragment, null, [serverData.url]);

async function getMusicUrl(id: string) {
    const url = `${Api.music}/music/${id}`
    try {
        const html = await fetch(url).then(
            response => response.text()
        )
        const matchBlock = html.match(
            /const url = 'https?:\/\/[^']+'/
        )
        return matchBlock[0].match(/https?:\/\/[^']+/)[0]
    }
    catch (err) {
        return null
    }
}

export async function getServerData({ query }: GetServerDataProps) {
    const { id } = query as Record<'id', string>;
    const parsedUrl = await getMusicUrl(id)
    if (parsedUrl) {
        return {
            props: {
                url: parsedUrl
            }
        }
    }
    return {
        status: 404
    }
}

export default Parser;
