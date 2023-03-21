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
import { SearchList } from '../../../components/search/List';
import BackgroundContainer from '../../../components/layout/BackgroundContainer';
import NoData from '../../../components/search/NoData';
import { Api } from '../../../util/config';

interface SearchResultProps {
    api: string;
    data: {
        name: string;
        page: ResponsePagination;
        video: VideoListItem[];
        types: VideoType[];
        type: number | null;
        s: string;
        prefer18: boolean;
    }
}

const SiteSearch: React.FunctionComponent<PageProps<object, object, unknown, SearchResultProps>> = ({ serverData }) => {

    const { data, api } = serverData;
    const responseError = data.video === undefined;
    const hasListData = !responseError && data.video.length > 0;

    const headTitle = useMemo(() => {
        return data.name + '站内查询到' + data.page.recordcount + '条记录';
    }, [data])

    return (
        <NoSsr>
            <Box sx={{
                height: '100%',
                backgroundImage: 'var(--linear-gradient-image)'
            }}>
                {
                    responseError ? (
                        <NoData text="💔 数据获取失败." />
                    ) : (
                        <BackgroundContainer prefer18={data.prefer18}>
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
                                        value={data.type ? String(data.type) : ''}
                                        variant="scrollable"
                                        scrollButtons="auto"
                                        allowScrollButtonsMobile
                                    >
                                        <Tab
                                            label="综合"
                                            value=""
                                            href={`/video/${api}` + (data.s !== '' ? `?s=${data.s}` : '')}
                                            component="a"
                                        />
                                        {
                                            data.types.map(
                                                type => (
                                                    <Tab
                                                        key={type.tid}
                                                        label={type.tname}
                                                        value={type.tid}
                                                        href={`/video/${serverData.api}?t=` + type.tid + (data.s !== '' ? `&s=${data.s}` : '')}
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
                                                        data={data.video}
                                                        api={api}
                                                        typed={Boolean(data.type)}
                                                    />
                                                </Box>
                                                <Stack sx={{
                                                    my: 1
                                                }} direction="row" justifyContent="center">
                                                    <Pagination
                                                        page={data.page.page}
                                                        count={data.page.pagecount}
                                                        variant="outlined"
                                                        color="primary"
                                                        renderItem={(item) => {
                                                            const searchParams = new URLSearchParams(window.location.search);
                                                            searchParams.set('page', String(item.page));
                                                            const href = `/video/${api}?` + searchParams.toString();
                                                            const current = item.page === data.page.page;
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
                    )
                }
            </Box>
        </NoSsr>
    )
}

export function Head({ serverData }: HeadProps<object, object, SearchResultProps>) {
    const { data } = serverData;
    const responseError = data.video === undefined;
    const typeName = useMemo(() => {
        const activeType = data.types.find(
            t => t.tid === String(data.type)
        )
        return activeType ? activeType.tname : null;
    }, [data.video, data.type])

    const pageTitle = useMemo(() => {
        let title = data.name + ' - 站内搜索';
        if (typeName) {
            title += ' - ' + typeName;
        }
        if (data.s === '') {
            return title;
        }
        return title + ` - ${data.s}`;
    }, [typeName, serverData])
    return (
        <title>{responseError ? '数据获取失败' : pageTitle}</title>
    )
}

export async function getServerData({ query, params }: GetServerDataProps) {
    const searchParams = new URLSearchParams(query as Record<string, string>)
    const { site } = params as Record<'site', string>;
    searchParams.set('api', site);
    try {
        const { code, data } = await fetch(`${Api.site}/api/video/list?${searchParams}`).then<ApiJsonType<SearchResultProps['data']>>(
            response => response.json()
        )
        if (code === 0 && 'video' in data) {
            return {
                props: {
                    data,
                    api: site
                }
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
