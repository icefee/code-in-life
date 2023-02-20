import React from 'react';
import { type PageProps, type GetServerDataProps } from 'gatsby';
import fetch from 'node-fetch';
import Box from '@mui/material/Box';
import VideoPlayer from '../../../components/player/PlayerBase';

interface ProxyPlayerProps {
    url: string;
}

const ProxyPlayer: React.FC<PageProps<object, object, unknown, ProxyPlayerProps>> = ({ serverData }) => {
    return (
        <Box sx={{
            height: '100%',
            bgcolor: '#000'
        }}>
            <VideoPlayer url={serverData.url} />
        </Box>
    )
}

async function parseVideoUrl(url: string) {
    try {
        const html = await fetch(url).then(
            response => response.text()
        )
        const matchedVideoUrl = html.match(
            /https:\/\/[\da-z]{4,10}\.[a-z]{2,5}\/assets\/[\da-z]+\.(mp4|m3u8)/g
        )
        if (matchedVideoUrl) {
            return matchedVideoUrl[0]
        }
        throw new Error('trigger retry.')
    }
    catch (err) {
        return null
    }
}

export async function getServerData({ query }: GetServerDataProps) {
    const { url } = query as Record<'url', string>;
    try {
        if (!url) {
            throw new Error('Search query url can not be empty')
        }
        const parsedUrl = await parseVideoUrl(url)
        if (parsedUrl) {
            return {
                props: {
                    url: parsedUrl
                }
            }
        }
        else {
            throw new Error('Get video detail error.')
        }
    }
    catch (err) {
        return {
            status: 404
        }
    }
}

export default ProxyPlayer;
