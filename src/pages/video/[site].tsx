import React, { useMemo } from 'react';
import type { GetServerDataProps, HeadProps, PageProps } from 'gatsby';
import fetch from 'node-fetch';
import NoSsr from '@mui/material/NoSsr';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { SearchList } from '../../components/search/List';
import BackgroundContainer from '../../components/layout/BackgroundContainer';
import NoData from '../../components/search/NoData';
import type { ResponsePagination, VideoListItem, VideoType } from '../../components/search/api';
import { Api } from '../../util/config';

interface SearchResultProps {
    siteName: string;
    keyword: string;
    api: string;
    videoData: {
        page: ResponsePagination;
        video: VideoListItem[];
        types: VideoType[];
    };
    prefer18: boolean;
    type: number | null;
}

const SiteSearch: React.FunctionComponent<PageProps<object, object, unknown, SearchResultProps>> = ({ serverData }) => {

    const hasListData = useMemo(() => {
        const { videoData } = serverData;
        return videoData && videoData.video.length > 0;
    }, [serverData])

    const headTitle = useMemo(() => {
        const { siteName, videoData } = serverData;
        return siteName + '站内查询到' + videoData.page.recordcount + '条记录';
    }, [serverData])

    return (
        <NoSsr>
            <Box sx={{
                height: '100%',
                backgroundImage: 'var(--linear-gradient-image)'
            }}>
                <BackgroundContainer prefer18={serverData.prefer18}>
                    <Box sx={{
                        position: 'relative',
                        height: '100%',
                        backdropFilter: 'contrast(.5)',
                        zIndex: 1
                    }}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            pr: .5
                        }}>
                            <Paper sx={(theme) => ({
                                m: theme.spacing(2, 2, 1, 2),
                                p: 1
                            })}>
                                <Typography variant="subtitle1">
                                    {headTitle}
                                </Typography>
                            </Paper>
                            <Tabs
                                value={serverData.type ? String(serverData.type) : ''}
                                variant="scrollable"
                                scrollButtons="auto"
                                allowScrollButtonsMobile
                            >
                                <Tab
                                    label="综合"
                                    value=""
                                    href={`/video/${serverData.api}` + (serverData.keyword !== '' ? `?s=${serverData.keyword}` : '')}
                                    component="a"
                                />
                                {
                                    serverData.videoData.types.map(
                                        type => (
                                            <Tab
                                                key={type.tid}
                                                label={type.tname}
                                                value={type.tid}
                                                href={`/video/${serverData.api}?t=` + type.tid + (serverData.keyword !== '' ? `&s=${serverData.keyword}` : '')}
                                                component="a"
                                            />
                                        )
                                    )
                                }
                            </Tabs>
                            {
                                hasListData ? (
                                    <>
                                        <Box sx={{
                                            flexGrow: 1,
                                            py: 1,
                                            px: 2,
                                            overflowY: 'auto'
                                        }}>
                                            <SearchList
                                                data={serverData.videoData.video}
                                                api={serverData.api}
                                                typed={Boolean(serverData.type)}
                                            />
                                        </Box>
                                        <Stack sx={{
                                            my: 1
                                        }} direction="row" justifyContent="center">
                                            <Pagination
                                                page={serverData.videoData.page.page}
                                                count={serverData.videoData.page.pagecount}
                                                variant="outlined"
                                                color="primary"
                                                renderItem={(item) => {
                                                    const { videoData, api } = serverData;
                                                    const searchParams = new URLSearchParams(window.location.search);
                                                    searchParams.set('page', String(item.page));
                                                    const href = `/video/${api}?` + searchParams.toString();
                                                    const current = item.page === videoData.page.page;
                                                    return (
                                                        <PaginationItem
                                                            component={Link}
                                                            href={current ? null : href}
                                                            disabled={current}
                                                            {...item}
                                                        />
                                                    )
                                                }}
                                            />
                                        </Stack>
                                    </>
                                ) : (
                                    <NoData />
                                )
                            }
                        </Box>
                    </Box>
                </BackgroundContainer>
            </Box>
        </NoSsr>
    )
}

export function Head({ serverData }: HeadProps<object, object, SearchResultProps>) {
    console.log(serverData)

    const typeName = useMemo(() => {
        const { videoData, type } = serverData;
        const activeType = videoData.types.find(
            t => t.tid === String(type)
        )
        return activeType ? activeType.tname : null;
    }, [serverData.videoData, serverData.type])

    const pageTitle = useMemo(() => {
        const { siteName, keyword } = serverData;
        let title = siteName + ' - 站内搜索';
        if (typeName) {
            title += ' - ' + typeName;
        }
        if (keyword === '') {
            return title;
        }
        return title + ` - ${keyword}`;
    }, [typeName, serverData])

    return (
        <title>{pageTitle}</title>
    )
}

export async function getServerData({ query, params }: GetServerDataProps) {
    const searchParams = new URLSearchParams(query as Record<string, string>)
    const { site } = params as Record<'site', string>;
    searchParams.set('site', site);
    try {
        const { code, data } = await fetch(`${Api.site}/api/video/list?${searchParams}`).then<ApiJsonType<SearchResultProps['videoData']>>(
            response => response.json()
        )
        if (code === 0) {
            return {
                props: data
            }
        }
        else {
            throw new Error(`Get data from ${site} error.`)
        }
    }
    catch (err) {
        return {
            status: 404
        }
    }
}

export default SiteSearch;
