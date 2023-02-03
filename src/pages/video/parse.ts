import React from 'react';
import type { GetServerDataProps, PageProps } from 'gatsby';
import { getM3u8Url } from '../../components/search/api';

interface ParserProps {
    url: string;
}

const Parser: React.FC<PageProps<object, object, unknown, ParserProps>> = ({ serverData }) => React.createElement(React.Fragment, null, [serverData.url]);

export async function getServerData({ query }: GetServerDataProps) {
    const { url } = query as Record<keyof ParserProps, string>;
    const parsedUrl = await getM3u8Url(url)
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
