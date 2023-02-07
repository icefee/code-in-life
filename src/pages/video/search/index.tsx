import React, { useState } from 'react';
import type { GetServerDataProps, HeadProps, PageProps } from 'gatsby';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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

    const { s = '', prefer = '', list } = serverData;
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
                            action="/video/search/"
                            value={keyword}
                            onChange={setKeyword}
                            staticFields={keyword.startsWith('$') ? {
                                prefer: '18'
                            } : null}
                        />
                    </Box>
                </Stack>
                {
                    s === '' ? (
                        <Stack sx={{
                            position: 'relative',
                            zIndex: 120
                        }} flexGrow={1} justifyContent="center" alignItems="center">
                            <Typography variant="body1" color="hsl(270, 64%, 84%)">🔍 输入关键词发起搜索</Typography>
                        </Stack>
                    ) : (
                        <Box sx={{
                            flexGrow: 1,
                            overflowY: 'auto'
                        }}>
                            <SearchResult keyword={keyword} videoList={list} />
                        </Box>
                    )
                }
            </BackgroundContainer>
        </StaticTheme>
    )
}

export function Head({ serverData }: HeadProps<object, object, VideoSearchProps>) {
    const { s } = serverData;
    let title = '影视搜索';
    if (s) {
        title += ' - ' + s
    }
    return (
        <title>{title}</title>
    )
}

export async function getServerData({ query }: GetServerDataProps) {
    const { s = '', prefer = '' } = query as Record<'s' | 'prefer', string>;
    if (s === '') {
        return {
            props: {
                list: []
            }
        }
    }
    const wd = s.startsWith('$') ? s.slice(1) : s;
    const url = Api.site + `/video/search/api?s=${wd}&prefer=${prefer}`;
    try {
        const list = await fetch(url).then(
            response => jsonBase64<SearchVideo[]>(response)
        )
        if (list) {
            return {
                props: {
                    list,
                    s,
                    prefer
                }
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
