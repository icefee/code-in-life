import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertProps } from '@mui/material/Alert';
import SearchResult from '../../../components/search/Result';
import SearchForm from '../../../components/search/Form';
import { SearchVideo } from '../../../components/search/api';
import BackgroundContainer from '../../../components/layout/BackgroundContainer';
import { LoadingOverlay } from '../../../components/loading';

const getSearch = async (s: string) => {
    try {
        const { code, data } = await fetch(
            `/api/video/list?s=${encodeURIComponent(s)}`
        ).then<{
            code: number;
            data: SearchVideo[];
        }>(response => response.json())
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

interface ToastMsg {
    msg: string;
    type: AlertProps['severity'];
}

interface SearchTask {
    keyword: string;
    result: SearchVideo[];
    pending: boolean;
    completed: boolean;
}

export default function VideoSearch() {

    const [keyword, setKeyword] = useState('')
    const [task, setTask] = useState<SearchTask>({
        keyword: '',
        result: [],
        pending: false,
        completed: false
    })
    const [toastMsg, setToastMsg] = useState<ToastMsg>(null)

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setToastMsg(null);
    }

    return (
        <BackgroundContainer
            style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
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
                                setTask(t => ({
                                    ...t,
                                    pending: true
                                }))
                                const result = await getSearch(keyword)
                                if (result) {
                                    setTask(t => ({
                                        ...t,
                                        pending: false,
                                        completed: true,
                                        keyword,
                                        result
                                    }))
                                }
                                else {
                                    setToastMsg({
                                        type: 'error',
                                        msg: '获取搜索结果失败, 可能是网络连接问题'
                                    })
                                    setTask(t => ({
                                        ...t,
                                        pending: false
                                    }))
                                }
                            }
                        }
                    />
                </Box>
            </Stack>
            {
                task.completed ? (
                    <Box sx={{
                        flexGrow: 1,
                        overflowY: 'auto'
                    }}>
                        <SearchResult
                            keyword={task.keyword}
                            videoList={task.result}
                        />
                    </Box>
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
                open={task.pending}
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
        </BackgroundContainer>
    )
}

export function Head() {
    return (
        <title>影视搜索</title>
    )
}
