import React, { useState } from 'react';
import type { GetServerDataProps, PageProps } from 'gatsby';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import SearchResult from '../../../components/search/Result';
import { StaticTheme } from '../../../components/theme';
import SearchForm from '../../../components/search/Form';
import { SearchVideo } from '../../../components/search/api';
import BackgroundContainer from '../../../components/layout/BackgroundContainer';
import { Api } from '../../../util/config';
import { jsonBase64 } from '../../../util/parser';

interface VideoSearchProps {
    s?: string;
    prefer?: string;
    list: SearchVideo[];
}

export default function VideoSearch({ serverData }: PageProps<object, object, unknown, VideoSearchProps>) {

    const { s = '', prefer, list } = serverData;
    const [keyword, setKeyword] = useState(s)

    return (
        <StaticTheme>
            <BackgroundContainer style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }} prefer18={prefer === '18'}>
                <Stack sx={{
                    position: 'relative',
                    zIndex: 100,
                    p: 2
                }} direction="row" justifyContent="center">
                    <Box sx={
                        (theme) => ({
                            width: '100%',
                            [theme.breakpoints.up('sm')]: {
                                width: 300
                            }
                        })
                    }>
                        <SearchForm
                            value={keyword}
                            onChange={setKeyword}
                            staticFields={{}}
                        />
                    </Box>
                </Stack>
                <SearchResult keyword={keyword} videoList={list} />
            </BackgroundContainer>
        </StaticTheme>
    )
}

export function Head() {
    return (
        <title>影视搜索</title>
    )
}

export async function getServerData({ query }: GetServerDataProps) {
    const { s = '', prefer } = query as Record<'s' | 'prefer', string>;
    const url = Api.site + `/video/search/api?s=${s}&prefer=${prefer}`;
    try {
        const list = await fetch(url).then(
            response => jsonBase64<SearchVideo[]>(response)
        )
        if (list) {
            return {
                list,
                s,
                prefer
            }
        }
        else {
            throw new Error('Get search error')
        }
    }
    catch (err) {
        return {
            status: 404
        }
    }
}
