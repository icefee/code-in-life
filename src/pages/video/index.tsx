import React, { useState, useMemo, useEffect, useRef } from 'react'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Snackbar from '@mui/material/Snackbar'
import Alert, { type AlertProps } from '@mui/material/Alert'
import SearchResult from '~/components/search/Result'
import SearchForm from '~/components/search/Form'
import NoData from '~/components/search/NoData'
import { LoadingOverlay } from '~/components/loading'
import { getJson } from '~/util/proxy'

interface SourceKeys {
    keys: string[];
    preferKeys: string[];
}

const parseKeyword = (s: string) => {
    return s.startsWith('$') ? s.slice(1) : s
}

export default function VideoSearch() {

    const [sourceKeys, setSourceKeys] = useState<SourceKeys | null>(null)

    const abortController = useRef<AbortController | null>(null)

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
        setToastMsg(null)
    }

    const getSourceKeys = async () => {
        const { code, data } = await getJson<ApiJsonType<SourceKeys>>('/api/video/source')
        if (code === 0) {
            setSourceKeys(data)
        }
    }

    const onSearch = async (text: string) => {

        if (sourceKeys === null) {
            setToastMsg({
                type: 'error',
                msg: '没有可用的源'
            })
            return
        }

        abortController.current?.abort()

        const s = text.trim()
        setSearchTask(t => ({
            ...t,
            data: [],
            success: false,
            completed: false,
            pending: true
        }))
        let keys = sourceKeys.keys
        const query = { s }
        if (s.startsWith('$')) {
            query.s = parseKeyword(s)
            keys = sourceKeys.preferKeys
        }
        for (const key of keys) {
            const [api, r] = key.split('_')
            const searchParams = new URLSearchParams({
                ...query,
                api
            })
            const rating = +r
            const controller = new AbortController()
            abortController.current = controller
            const { data } = await getJson<ApiJsonType<{
                name: string;
                page: ResponsePagination;
                video?: VideoListItem[];
            }>>(
                `/api/video/list?${searchParams}`,
                {
                    signal: controller.signal
                }
            )
            if (data) {
                const { name, video, page } = data
                if (video && video.length > 0) {
                    setSearchTask(t => ({
                        ...t,
                        pending: false,
                        keyword: query.s,
                        success: true,
                        data: [...t.data, {
                            key: api,
                            name,
                            rating,
                            data: video,
                            page
                        }].sort((prev, next) => next.rating - prev.rating)
                    }))
                }
            }
        }
        abortController.current = null
        setSearchTask(t => ({
            ...t,
            completed: true
        }))
    }

    const pageTitle = useMemo(() => {
        let keyword = '影视搜索';
        if (searchTask.keyword !== '') {
            keyword += ' - ' + parseKeyword(searchTask.keyword)
        }
        return keyword;
    }, [searchTask.keyword])

    useEffect(() => {
        getSourceKeys()
    }, [])

    return (
        <Stack
            style={{
                height: '100%',
                backgroundImage: 'var(--linear-gradient-image)'
            }}
        >
            <title>{pageTitle}</title>
            <Stack
                sx={{
                    position: 'absolute',
                    width: '100%',
                    zIndex: 150,
                    p: 1.5
                }}
                direction="row"
                justifyContent="center"
            >
                <Box
                    sx={
                        ({ breakpoints }) => ({
                            width: '100%',
                            [breakpoints.up('sm')]: {
                                width: 320
                            }
                        })
                    }
                >
                    <SearchForm
                        loading={searchTask.pending}
                        disabled={sourceKeys === null}
                        value={keyword}
                        onChange={setKeyword}
                        onSubmit={onSearch}
                        autocompleteKey="video"
                    />
                </Box>
            </Stack>
            <Stack
                sx={{
                    position: 'relative',
                    overflow: 'hidden'
                }}
                flexGrow={1}
            >
                {
                    searchTask.success ? (
                        searchTask.data.length > 0 ? (
                            <Box sx={{
                                flexGrow: 1,
                                overflow: 'hidden',
                                pt: 9
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
                        !searchTask.pending && (
                            <Stack
                                sx={{
                                    position: 'relative',
                                    zIndex: 120
                                }}
                                flexGrow={1}
                                justifyContent="center"
                                alignItems="center"
                            >
                                {
                                    sourceKeys === null ? (
                                        <Typography>⌛ 查询源数据中...</Typography>
                                    ) : (
                                        <Typography variant="body1" color="text.secondary">🔍 输入关键词开始搜索</Typography>
                                    )
                                }
                            </Stack>
                        )
                    )
                }
                <LoadingOverlay
                    open={searchTask.pending}
                    label="搜索中.."
                    withoutBackdrop
                    withBackground
                />
            </Stack>
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