import React, { useState, useMemo } from 'react';
import type { GetServerDataProps, HeadProps, PageProps } from 'gatsby';
import fetch from 'node-fetch';
import NoSsr from '@mui/material/NoSsr';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { SearchList } from '../../components/search/List';
import BackgroundContainer from '../../components/layout/BackgroundContainer';
import SearchForm from '../../components/search/Form';
import NoData from '../../components/search/NoData';
import { Api } from '../../util/config';

interface SearchResultProps {
    api: string;
    data: {
        name: string;
        page: ResponsePagination;
        video?: VideoListItem[];
        types: VideoType[];
        type: number | null;
        s: string;
        prefer18: boolean;
    }
}

const SiteSearch: React.FunctionComponent<PageProps<object, object, unknown, SearchResultProps>> = ({ serverData, location }) => {

    const { data, api } = serverData;
    const urlSearchParams = new URLSearchParams(location.search)
    const responseError = data.video === undefined;
    const hasListData = !responseError && data.video.length > 0;

    const [keyword, setKeyword] = useState(data.s);

    const headTitle = useMemo(() => {
        return data.name + '站内查询到' + data.page.recordcount + '条记录';
    }, [data])

    const searchPage = useMemo(() => {
        const page = urlSearchParams.get('p')
        if (page !== null && page !== '') {
            return Number(page)
        }
        return 1
    }, [urlSearchParams])

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
                                    <Stack sx={{
                                        p: (theme) => theme.spacing(1.5, 1.5, 1)
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
                                                onSubmit={
                                                    (value) => {
                                                        const searchParams = new URLSearchParams(window.location.search)
                                                        searchParams.set('s', value)
                                                        searchParams.delete('p')
                                                        window.location.href = `/video/${api}?${searchParams}`
                                                    }
                                                }
                                            />
                                        </Box>
                                    </Stack>
                                    <Box sx={(theme) => ({
                                        m: theme.spacing(0, 1.5, .5),
                                        p: 1,
                                        borderTopLeftRadius: theme.shape.borderRadius,
                                        borderBottomLeftRadius: theme.shape.borderRadius,
                                        backgroundImage: `linear-gradient(90deg, ${alpha(theme.palette.background.paper, .5)}, transparent)`
                                    })}>
                                        <Typography variant="subtitle1">
                                            {headTitle}
                                        </Typography>
                                    </Box>
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
                                                        page={data.page.page ?? searchPage}
                                                        count={data.page.pagecount}
                                                        variant="outlined"
                                                        color="primary"
                                                        renderItem={(item) => {
                                                            const searchParams = new URLSearchParams(window.location.search);
                                                            searchParams.set('p', String(item.page));
                                                            const href = `/video/${api}?${searchParams}`;
                                                            const current = item.page === data.page.page;
                                                            return (
                                                                <PaginationItem
                                                                    {...item}
                                                                    component={Link}
                                                                    href={current ? null : href}
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

    const getPageTitle = () => {
        if (serverData) {
            const { data } = serverData;
            if (data.video) {
                const activeType = data.types.find(
                    t => t.tid === String(data.type)
                )
                let title = data.name + ' - 站内搜索';
                if (activeType) {
                    title += ' - ' + activeType.tname;
                }
                if (data.s !== '') {
                    title += ` - ${data.s}`;
                }
                return title;
            }
            return '数据获取失败'
        }
        return '数据加载中'
    }

    const pageTitle = getPageTitle()

    return (
        <title>{pageTitle}</title>
    )
}

export async function getServerData({ query, params }: GetServerDataProps) {
    const searchParams = new URLSearchParams(query as Record<string, string>)
    const { api } = params as Record<'api', string>;
    searchParams.set('api', api);
    try {
        const { code, data } = await fetch(`${Api.site}/api/video/list?${searchParams}`).then<ApiJsonType<SearchResultProps['data']>>(
            response => response.json()
        )
        if (code === 0 && 'video' in data) {
            return {
                props: {
                    data,
                    api
                }
            }
        }
        else {
            throw new Error(`Get data from ${api} error.`)
        }
    }
    catch (err) {
        return {
            status: 404
        }
    }
}

export default SiteSearch;
