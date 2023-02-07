import React, { useState, useMemo } from 'react';
import type { GetServerDataProps, PageProps } from 'gatsby';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { StaticTheme } from '../../../components/theme';
import BackgroundContainer from '../../../components/layout/BackgroundContainer';
import SearchForm from '../../../components/search/Form';
import ThumbLoader from '../../../components/search/ThumbLoader';
import RowClipTypography from '../../../components/layout/element/RowClipTypography';
import NoData from '../../../components/search/NoData';

interface SearchResult {
    data: SearchVideo[];
    totalPage: number;
    page: number;
}

interface SearchVideo {
    videoInfoId: number;
    videoTitle: string;
    pageUrl: string;
    createTime: string;
    videoImgUrl: string;
}

const posterUrl = 'https://2e68cq.8gosimg.top:8443';
const sparePosterUrl = 'https://8x2um.xyz:8443';

const checkUrl = 'https://8xx.live';

async function getLatest(page: number, host: string) {
    let api = `https://${host}/video`;
    if (page > 1) {
        api += '/page/' + page
    }
    try {
        const html = await fetch(api).then(
            response => response.text()
        )
        let total = html.match(
            /<a href=\"\/video\/page\/\d{1,9}\/\" aria-label=\"末页\">/g
        )?.[0].match(/[1-9]\d{1,8}/g)?.[0]

        if (!total) {
            total = html.match(
                /<a aria-label=\"第 [1-9]\d{1,8} 页\">[1-9]\d{1,8}<\/a>/g
            )?.[0].match(/[1-9]\d{1,8}/g)?.[0]

            if (!total) {
                throw new Error('page match error')
            }
        }

        const posters = html.match(
            new RegExp('(' + posterUrl + '|' + sparePosterUrl + ')' + '.+?\.webp', 'g')
        )
        const data = html.match(
            /<a href=\"\/video\/\d{1,9}\/\">.+?<\/a>/g
        )?.map(
            (link, index) => {
                const pageUrl = link.match(
                    /\/video\/\d{1,9}\//g
                )?.[0];
                const videoId = pageUrl?.match(
                    /\d{1,9}/
                )?.[0]

                const videoTitle = link.match(
                    /(?<=<a href=\"\/video\/\d{1,9}\/\">).+?(?=<\/a>)/g
                )?.[0]

                return {
                    videoInfoId: parseInt(videoId),
                    videoTitle,
                    pageUrl,
                    createTime: '',
                    videoImgUrl: posters[index]?.replace(new RegExp('(' + posterUrl + '|' + sparePosterUrl + ')'), '')
                }
            }
        )

        return {
            data,
            totalPage: parseInt(total),
            page
        }
    }
    catch (err) {
        return null;
    }
}

async function getSearch(title: string, page: number, host: string) {
    try {
        const url = `https://s.${host}/search`;
        const data = await fetch(url, {
            method: 'POST',
            body: new URLSearchParams({
                title,
                current: String(page),
                source: 'v1',
                size: '16'
            })
        }).then<SearchResult | null>(
            response => response.json()
        )
        return data;
    }
    catch (err) {
        return null
    }
}

async function getMatch(url: string, reg: RegExp) {
    try {
        const html = await fetch(url).then(
            response => response.text()
        )
        const matchedResult = html.match(reg);
        if (matchedResult) {
            return matchedResult[0];
        }
        return null;
    }
    catch (err) {
        return null;
    }
}

async function checkHost() {
    const redirectUrl = await getMatch(checkUrl, /https?:\/\/.+?\/redirect\//g)
    if (redirectUrl) {
        const host = await getMatch(redirectUrl, /[a-z\d]{3,}\.(xyz|buzz|top|com|io|live)/g)
        return host;
    }
    return null;
}

interface ProxyProps {
    s?: string;
    p?: string;
    host?: string;
    list?: SearchResult;
}

function Proxy({ serverData }: PageProps<object, object, unknown, ProxyProps>) {

    const { s = '', p, host, list } = serverData;
    const [keyword, setKeyword] = useState(s);

    const refreshUrl = useMemo(() => `/video/proxy/?s=${s}&pg=${p}`, [s, p])

    const layerWrapper: (child: React.ReactNode) => React.ReactNode = child => (
        <Stack sx={{
            position: 'relative',
            height: '100%',
            zIndex: 40
        }} justifyContent="center" alignItems="center">
            {child}
        </Stack>
    )

    return (
        <StaticTheme>
            <BackgroundContainer style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }} prefer18>
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
                            action="/video/proxy/"
                            value={keyword}
                            onChange={setKeyword}
                            staticFields={{
                                host
                            }}
                        />
                    </Box>
                </Stack>
                {
                    list ? list.data.length > 0 ? (
                        <Stack sx={{
                            position: 'relative',
                            zIndex: 90,
                            overflow: 'hidden'
                        }} flexGrow={1}>
                            <Box sx={{
                                flexGrow: 1,
                                px: 2,
                                overflowY: 'auto'
                            }}>
                                <Grid spacing={2} container>
                                    {
                                        list.data.map(
                                            (video) => (
                                                <Grid xs={12} sm={6} lg={3} key={video.videoInfoId} item>
                                                    <Card sx={{
                                                        bgcolor: 'background.paper'
                                                    }} elevation={2}>
                                                        <CardActionArea href={'/video/proxy/player/?url=https://' + host + video.pageUrl} target="_blank">
                                                            <Stack direction="row">
                                                                <Box sx={{
                                                                    width: 125,
                                                                    height: 180,
                                                                    flexShrink: 0
                                                                }}>
                                                                    <ThumbLoader
                                                                        src={posterUrl + video.videoImgUrl}
                                                                        fill
                                                                        alt={video.videoTitle}
                                                                        errorText="缩略图加载失败"
                                                                    />
                                                                </Box>
                                                                <Box sx={{
                                                                    flexGrow: 1,
                                                                    p: 1.5,
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    <Stack sx={{
                                                                        height: '100%',
                                                                        justifyContent: 'space-between'
                                                                    }}>
                                                                        <Tooltip title={video.videoTitle}>
                                                                            <Box>
                                                                                <RowClipTypography
                                                                                    lineHeight={1.2}
                                                                                    rows={4}
                                                                                    variant="h5"
                                                                                    paragraph
                                                                                >{video.videoTitle}</RowClipTypography>
                                                                            </Box>
                                                                        </Tooltip>
                                                                        <Typography variant="subtitle2" color="text.secondary" align="right">{video.createTime}</Typography>
                                                                    </Stack>
                                                                </Box>
                                                            </Stack>
                                                        </CardActionArea>
                                                    </Card>
                                                </Grid>
                                            )
                                        )
                                    }
                                </Grid>
                            </Box>
                            <Stack sx={{
                                px: 1,
                                py: 2
                            }} direction="row" justifyContent="center">
                                <Pagination
                                    page={list.page}
                                    count={list.totalPage}
                                    variant="outlined"
                                    color="primary"
                                    renderItem={(item) => {
                                        const searchParams = new URLSearchParams({
                                            s: keyword,
                                            host
                                        })
                                        searchParams.set('p', String(item.page));
                                        const href = `/video/proxy/?` + searchParams.toString();
                                        const current = item.page === list.page;
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
                        </Stack>
                    ) : layerWrapper(
                        <NoData />
                    ) : layerWrapper(
                        <>
                            <Typography sx={{
                                mb: 2
                            }} color="text.secondary">当前链接已失效, 请尝试重新获取</Typography>
                            <Button variant="outlined" href={refreshUrl}>重新获取</Button>
                        </>
                    )
                }
            </BackgroundContainer>
        </StaticTheme>
    )
}

export function Head() {
    return (
        <title>Proxy video</title>
    )
}

export async function getServerData({ query }: GetServerDataProps) {
    try {
        let { host, s = '', p } = query as Record<string, string>;
        if (!host) {
            const latestHost = await checkHost();
            if (latestHost) {
                host = latestHost;
            }
            else {
                throw new Error('Get latest host faild.')
            }
        }
        const pg = p ? Number(p) : 1;
        if (s) {
            const list = await getSearch(s, pg, host)
            return {
                props: {
                    s: decodeURIComponent(s),
                    p: pg,
                    host,
                    list
                }
            }
        }
        else {
            const list = await getLatest(pg, host)
            return {
                props: {
                    host,
                    p: pg,
                    list
                }
            }
        }
    }
    catch (err) {
        return {
            status: 404
        }
    }
}

export default Proxy;
