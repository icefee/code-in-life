import React, { useState, useEffect, useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { SearchList } from './List';
import NoData from './NoData';

interface SearchResultProps {
    keyword: string;
    videoList: SearchVideo[];
}

function SearchResult({ keyword, videoList }: SearchResultProps) {

    const total = useMemo(() => videoList.reduce((prev, current) => prev + current.data.length, 0), [videoList])
    const tabTypeThreshold = 60

    return (
        <Box sx={{
            height: '100%'
        }}>
            {
                videoList.length > 0 ? total > tabTypeThreshold ? (
                    <TabType
                        videoList={videoList}
                        keyword={keyword}
                    />
                ) : (
                    <ListType
                        videoList={videoList}
                        keyword={keyword}
                    />
                ) : (
                    <NoData />
                )
            }
        </Box>
    )
}

function ListType({ videoList, keyword }: SearchResultProps) {

    return (
        <Box sx={{
            height: '100%',
            overflowY: 'auto'
        }}>
            {
                videoList.map(
                    ({ key, name, rating, data, page }) => (
                        <List key={key} sx={{
                            bgcolor: 'transparent'
                        }} component="div" subheader={
                            <ListSubheader component="div" sx={
                                (theme) => ({
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    bgcolor: alpha(theme.palette.background.paper, .75),
                                    pl: 4,
                                    pr: 1,
                                    py: 1,
                                    mx: 1.5,
                                    backdropFilter: 'blur(2px)',
                                    boxShadow: theme.shadows[2],
                                    '&::before': {
                                        content: '""',
                                        bgcolor: theme.palette.primary.main,
                                        position: 'absolute',
                                        left: 12,
                                        top: 'calc(50% - 8px)',
                                        width: 5,
                                        height: 16
                                    }
                                })
                            } color="primary">
                                <Stack direction="row" alignItems="center" columnGap={1}>
                                    <Typography>{name}</Typography>
                                    <Rating
                                        defaultValue={rating}
                                        precision={.1}
                                        size="small"
                                        readOnly
                                    />
                                </Stack>
                                <Button
                                    LinkComponent="a"
                                    href={`/video/${key}`}
                                    target="_blank"
                                    size="small"
                                    startIcon={
                                        <ManageSearchIcon />
                                    }
                                >站内查询</Button>
                            </ListSubheader>
                        }>
                            <Box sx={(theme) => ({
                                p: theme.spacing(1, 1.5, 2.5)
                            })}>
                                <SearchList
                                    data={data}
                                    api={key}
                                />
                            </Box>
                            {
                                page.pagecount > 1 && (
                                    <Box sx={(theme) => ({
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        p: theme.spacing(0, 2, 2),
                                        color: '#fff'
                                    })}>
                                        <Button
                                            LinkComponent="a"
                                            variant="outlined"
                                            color="inherit"
                                            endIcon={
                                                <ArrowForwardIosIcon />
                                            }
                                            href={'/video/' + key + '?s=' + keyword + '&p=2'}
                                            target="_blank"
                                        >更多</Button>
                                    </Box>
                                )
                            }
                        </List>
                    )
                )
            }
        </Box>
    )
}

function TabType({ videoList, keyword }: SearchResultProps) {

    const [activeTab, setActiveTab] = useState(0)
    const activeList = useMemo(() => videoList[activeTab], [videoList, activeTab])
    const scroller = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        scroller.current?.scrollTo(0, 0)
    }, [activeTab])

    return (
        <Stack sx={{
            position: 'relative',
            height: '100%',
            overflow: 'hidden'
        }}>
            <Paper sx={{
                position: 'absolute',
                left: 12,
                top: 0,
                right: 12,
                zIndex: 5
            }} elevation={3}>
                <Tabs
                    value={activeTab}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    onChange={
                        (_event, active: number) => {
                            setActiveTab(active);
                        }
                    }
                >
                    {
                        videoList.map(
                            ({ key, name }, index) => (
                                <Tab
                                    key={key}
                                    label={name}
                                    value={index}
                                />
                            )
                        )
                    }
                </Tabs>
                <Divider />
                <Stack
                    sx={{
                        p: 1
                    }}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Stack direction="row" alignItems="center" columnGap={1}>
                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                        >当前{Math.min(activeList.page.pagesize, activeList.page.recordcount)} / {activeList.page.recordcount}条记录</Typography>
                        <Rating
                            value={activeList.rating}
                            precision={.1}
                            size="small"
                            readOnly
                        />
                    </Stack>
                    <Button
                        LinkComponent="a"
                        href={`/video/${activeList.key}`}
                        target="_blank"
                        size="small"
                        startIcon={
                            <ManageSearchIcon />
                        }
                    >站内查询</Button>
                </Stack>
            </Paper>
            <Box sx={(theme) => ({
                flexGrow: 1,
                p: theme.spacing(14, 1.5, 2),
                overflowY: 'auto'
            })} ref={scroller}>
                <SearchList
                    data={activeList.data}
                    api={activeList.key}
                />
                {
                    activeList.page.pagecount > 1 && (
                        <Stack
                            direction="row"
                            justifyContent="flex-end"
                            sx={{
                                mt: 2
                            }}
                        >
                            <Button
                                LinkComponent="a"
                                variant="outlined"
                                endIcon={
                                    <ArrowForwardIosIcon />
                                }
                                href={'/video/' + activeList.key + '?s=' + keyword + '&p=2'}
                                target="_blank"
                            >更多</Button>
                        </Stack>
                    )
                }
            </Box>
        </Stack>
    )
}

export default SearchResult
