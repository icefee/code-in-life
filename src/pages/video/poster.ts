import React from 'react';
import type { GetServerDataProps, PageProps } from 'gatsby';
import { Api } from '../../util/config';
import { image } from '../../util/parser';

interface PosterParserProps {
    url: string;
}

const PosterParser: React.FC<PageProps<object, object, unknown, PosterParserProps>> = ({ serverData }) => React.createElement(React.Fragment, null, [serverData.url]);

async function getPosterUrl(api: string, id: string) {
    const url = `${Api.site}/video/${api}/${id}/poster`;
    try {
        const parsedUrl = await fetch(url).then(image);
        return parsedUrl;
    }
    catch (err) {
        return null;
    }
}

export async function getServerData({ query }: GetServerDataProps) {
    const { api, id } = query as Record<'api' | 'id', string>;
    const posterUrl = await getPosterUrl(api, id)
    if (posterUrl) {
        return {
            props: {
                url: posterUrl
            }
        }
    }
    return {
        status: 404
    }
}

export default PosterParser;
