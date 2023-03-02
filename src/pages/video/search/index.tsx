import React, { useState, useMemo } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertProps } from '@mui/material/Alert';
import SearchResult from '../../../components/search/Result';
import SearchForm from '../../../components/search/Form';
import NoData from '../../../components/search/NoData';
import { LoadingOverlay } from '../../../components/loading';

const getSearch = async (s: string) => {
    try {
        const searchParams = new URLSearchParams()
        if (s.startsWith('$')) {
            searchParams.set('s', parseKeyword(s))
            searchParams.set('prefer', '18')
        }
        else {
            searchParams.set('s', s)
        }
        const { code, data } = await fetch(
            `/api/video/list?${searchParams}`
        ).then<ApiJsonType<SearchVideo[]>>(response => response.json())
        if (code === 0) {
            return data;
        }
        else {
            throw new Error('get search failed');
        }
    }
    catch (err) {
        return null;
    }
}

const parseKeyword = (s: string) => {
    return s.startsWith('$') ? s.slice(1) : s;
}

export default function VideoSearch() {

    const [keyword, setKeyword] = useState('')
    const [searchTask, setSearchTask] = useState<SearchTask<SearchVideo>>({
        keyword: '',
        data: [],
        pending: false,
        complete: false,
        success: false
    })
    const [toastMsg, setToastMsg] = useState<ToastMsg<AlertProps['severity']>>(null)

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setToastMsg(null);
    }

    const pageTitle = useMemo(() => {
        let keyword = '影视搜索';
        if (searchTask.keyword !== '') {
            keyword += ' - ' + parseKeyword(searchTask.keyword);
        }
        return keyword;
    }, [searchTask.keyword])

    return (
        <Stack
            style={{
                height: '100%',
                backgroundImage: 'var(--linear-gradient-image)'
            }}>
            <title>{pageTitle}</title>
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
                        onSubmit={
                            async () => {
                                setSearchTask(t => ({
                                    ...t,
                                    completed: false,
                                    pending: true
                                }))
                                const data = await getSearch(keyword)
                                if (data) {
                                    setSearchTask({
                                        pending: false,
                                        complete: true,
                                        keyword,
                                        success: true,
                                        data
                                    })
                                }
                                else {
                                    setToastMsg({
                                        type: 'error',
                                        msg: '获取搜索结果失败, 可能是网络连接问题'
                                    })
                                    setSearchTask(t => ({
                                        ...t,
                                        pending: false,
                                        completed: true
                                    }))
                                }
                            }
                        }
                    />
                </Box>
            </Stack>
            {
                searchTask.success ? (
                    searchTask.data.length > 0 ? (
                        <Box sx={{
                            flexGrow: 1,
                            overflowY: 'auto'
                        }}>
                            <SearchResult
                                keyword={searchTask.keyword}
                                videoList={searchTask.data}
                            />
                        </Box>
                    ) : (
                        <NoData text='💔 没有找到相关的内容, 换个关键词试试吧' />
                    )
                ) : (
                    <Stack sx={{
                        position: 'relative',
                        zIndex: 120
                    }} flexGrow={1} justifyContent="center" alignItems="center">
                        <Typography variant="body1" color="hsl(270, 100%, 100%)">🔍 输入关键词开始搜索</Typography>
                    </Stack>
                )
            }
            <LoadingOverlay
                open={searchTask.pending}
                label="搜索中.."
                withBackground
                labelColor="#fff"
            />
            <Snackbar
                open={Boolean(toastMsg)}
                autoHideDuration={5000}
                onClose={
                    () => setToastMsg(null)
                }
                anchorOrigin={{
                    horizontal: 'center',
                    vertical: 'bottom'
                }}
            >
                {
                    toastMsg && (
                        <Alert severity={toastMsg.type} onClose={handleClose}>{toastMsg.msg}</Alert>
                    )
                }
            </Snackbar>
        </Stack>
    )
}
