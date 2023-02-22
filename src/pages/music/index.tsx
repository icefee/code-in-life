import React, { useState, useRef } from 'react';
import type { GetServerDataProps, HeadProps, PageProps } from 'gatsby';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
// import MusicNoteIcon from '@mui/icons-material/MusicNote';
import DownloadIcon from '@mui/icons-material/Download';
import SearchForm from '../../components/search/Form';
import { Api } from '../../util/config';
import { LoadingOverlay } from '../../components/loading';
import MusicPlayer, { type SearchMusic, type MusicInfo, type PlayingMusic } from '../../components/player/MusicPlayer';
import PlayOrPauseButton from '../../components/player/PlayOrPauseButton';

interface MusicSearchProps {
    s?: string;
    list: SearchMusic[];
}

export default function MusicSearch({ serverData }: PageProps<object, object, unknown, MusicSearchProps>) {

    const { s = '', list } = serverData;
    const [keyword, setKeyword] = useState(s)
    const [error, setError] = useState(false)

    const [activeMusic, setActiveMusic] = useState<PlayingMusic>()
    const [playing, setPlaying] = useState(false)
    const musicUrlMap = useRef<Map<number, MusicInfo>>(new Map())

    const [urlParsing, setUrlParsing] = useState(false)

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setError(false);
    }

    const getMusicUrl = async (id: SearchMusic['id']) => {
        const cachedMusicUrl = musicUrlMap.current.get(id);
        if (cachedMusicUrl) {
            return cachedMusicUrl;
        }
        setUrlParsing(true)
        const musicInfo = await parseMusic(id)
        if (musicInfo) {
            musicUrlMap.current.set(id, musicInfo);
        }
        setUrlParsing(false)
        return musicInfo;
    }

    return (
        <Stack sx={{
            height: '100%',
            backgroundImage: 'var(--linear-gradient-image)'
        }} direction="column">
            <Stack sx={{
                position: 'absolute',
                width: '100%',
                zIndex: 150,
                p: 1
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
                        action="/music"
                        value={keyword}
                        onChange={setKeyword}
                    />
                </Box>
            </Stack>
            {
                s === '' ? (
                    <Stack sx={{
                        position: 'relative',
                        zIndex: 120
                    }} flexGrow={1} justifyContent="center" alignItems="center">
                        <Typography variant="body1" color="hsl(270, 64%, 84%)">🔍 输入歌名/歌手名开始搜索</Typography>
                    </Stack>
                ) : (
                    <Box sx={{
                        position: 'relative',
                        flexGrow: 1,
                        overflow: 'hidden',
                        pt: 8,
                        width: '100%',
                        maxWidth: 600,
                        margin: '0 auto'
                    }}>
                        <Box sx={(theme) => ({
                            height: '100%',
                            pt: 1,
                            px: 1,
                            overflowY: 'auto',
                            pb: activeMusic ? 13 : 2,
                            [theme.breakpoints.up('sm')]: {
                                pb: activeMusic ? 16 : 2
                            }
                        })}>
                            <List sx={{
                                bgcolor: 'background.paper'
                            }}>
                                {
                                    list.map(
                                        (music, index) => (
                                            <ListItem
                                                secondaryAction={
                                                    <Tooltip title="下载歌曲">
                                                        <IconButton color="inherit" onClick={
                                                            async () => {
                                                                const musicInfo = await getMusicUrl(music.id)
                                                                if (musicInfo) {
                                                                    window.open(
                                                                        `/api/music/download?name=${encodeURIComponent(`${music.artist}-${music.name}`)}&id=${btoa(musicInfo.url)}`
                                                                    )
                                                                }
                                                                else {
                                                                    setError(true)
                                                                }
                                                            }
                                                        }>
                                                            <DownloadIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                }
                                                divider={index < list.length - 1}
                                                key={music.id}
                                            >
                                                <ListItemAvatar>
                                                    <Tooltip title="试听歌曲">
                                                        <Avatar sx={{
                                                            backgroundImage: 'var(--linear-gradient-image)'
                                                        }}>
                                                            <PlayOrPauseButton
                                                                playing={activeMusic && activeMusic.id === music.id && playing}
                                                                onTogglePlay={
                                                                    async () => {
                                                                        if (activeMusic && music.id === activeMusic.id) {
                                                                            setPlaying(
                                                                                state => !state
                                                                            )
                                                                        }
                                                                        else {
                                                                            const musicInfo = await getMusicUrl(music.id)
                                                                            if (musicInfo) {
                                                                                setActiveMusic({
                                                                                    ...music,
                                                                                    ...musicInfo
                                                                                })
                                                                                setPlaying(true)
                                                                            }
                                                                            else {
                                                                                setError(true)
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            />
                                                        </Avatar>
                                                    </Tooltip>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={music.name}
                                                    primaryTypographyProps={{
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                    secondary={music.artist}
                                                />
                                            </ListItem>
                                        )
                                    )
                                }
                            </List>
                        </Box>
                        <Slide direction="up" in={Boolean(activeMusic)} mountOnEnter unmountOnExit>
                            <Box sx={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                boxShadow: '0px -4px 12px 0px rgb(0 0 0 / 80%)'
                            }}>
                                <MusicPlayer
                                    music={activeMusic}
                                    playing={playing}
                                    onPlayStateChange={setPlaying}
                                />
                            </Box>
                        </Slide>
                        <LoadingOverlay
                            open={urlParsing}
                            label="地址解析中.."
                            withBackground
                            labelColor="#fff"
                        />
                    </Box>
                )
            }
            <Snackbar open={error} autoHideDuration={5000} onClose={
                () => setError(false)
            } anchorOrigin={{
                horizontal: 'center',
                vertical: 'bottom'
            }}>
                <Alert severity="error" onClose={handleClose}>当前歌曲不可用</Alert>
            </Snackbar>
        </Stack>
    )
}

async function parseMusic<T extends MusicInfo = MusicInfo>(id: number): Promise<T | null> {
    try {
        const { code, data } = await fetch(
            `/api/music/parse?id=${id}`
        ).then<{
            code: number;
            data: T;
        }>(
            response => response.json()
        );
        if (code === 0) {
            return data;
        }
        else {
            throw new Error('url parse error');
        }
    }
    catch (err) {
        return null;
    }
}

export function Head({ serverData }: HeadProps<object, object, MusicSearchProps>) {
    const { s } = serverData;
    let title = '音乐搜索';
    if (s) {
        title += ' - ' + s
    }
    return (
        <title>{title}</title>
    )
}

async function getMusicSearch(s: string): Promise<SearchMusic[]> {
    const url = `${Api.music}/s/${s}`;
    try {
        const html = await fetch(url).then(
            response => response.text()
        )
        const matchBlocks = html.replace(/[\n\s\r]+/g, '').replace(new RegExp('&amp;', 'g'), '&').match(
            /<tr><td><ahref="\/music\/\d+"class="text-primaryfont-weight-bold"target="_blank">[^<]+<\/a><\/td><tdclass="text-success">[^<]+<\/td><td><ahref="\/music\/\d+"target="_blank"><u>下载<\/u><\/a><\/td><\/tr>/g
        )
        if (matchBlocks) {
            return matchBlocks.map(
                (block) => {
                    const url = block.match(/music\/\d+/)[0]
                    const id = url.match(/\d+/)
                    const nameBlock = block.match(/(?<=<ahref="\/music\/\d+"class="text-primaryfont-weight-bold"target="_blank">)[^<]+(?=<\/a>)/)
                    const artistBlock = block.match(/(?<=<tdclass="text-success">)[^<]+(?=<\/td>)/)
                    return {
                        id: parseInt(id[0]),
                        name: nameBlock[0],
                        artist: artistBlock[0]
                    }
                }
            )
        }
        return [];
    }
    catch (err) {
        return null;
    }
}

export async function getServerData({ query }: GetServerDataProps) {
    const { s = '' } = query as Record<'s', string>;
    if (s === '') {
        return {
            props: {
                list: []
            }
        }
    }
    try {
        const list = await getMusicSearch(s)
        if (list) {
            return {
                props: {
                    list,
                    s: decodeURIComponent(s)
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
