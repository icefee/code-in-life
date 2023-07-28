import React, { useState, useEffect, useRef, useMemo } from 'react'
import type { ReactNode, MouseEvent, MouseEventHandler } from 'react'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader'
import InputBase from '@mui/material/InputBase'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ClearAllRoundedIcon from '@mui/icons-material/ClearAllRounded'
import ManageSearchRoundedIcon from '@mui/icons-material/ManageSearchRounded'
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchOutlined'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import PublishRoundedIcon from '@mui/icons-material/PublishRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import LyricsRoundedIcon from '@mui/icons-material/LyricsRounded'
import PlaylistRemoveRoundedIcon from '@mui/icons-material/PlaylistRemoveRounded'
import { DarkThemed } from '../theme'
import MusicPoster from './MusicPoster'
import { MusicPlay as MusicPlayIcon } from '../loading'
import useMenu from '../hook/useMenu'

const StyledInput = styled(InputBase)(({ theme }) => ({
    fontSize: '.8em',
    '& .MuiInputBase-input': {
        width: 100,
        transition: theme.transitions.create('width'),
    },
    '& .MuiInputBase-input:focus': {
        width: 120
    }
}))

const MatchText = styled('span')(({ theme }) => ({
    backgroundColor: theme.palette.secondary.main
}))

type ListMatch = {
    id: SearchMusic['id'];
    name: ReactNode;
    artist: ReactNode;
    firstMatch: boolean;
}

type SearchMusicWithMatch = SearchMusic & { match?: Omit<ListMatch, 'id'> };

interface MusicPlayListProps {
    show: boolean;
    data: SearchMusic[];
    onChange: React.Dispatch<React.SetStateAction<SearchMusic[]>>;
    current: SearchMusic;
    playing: boolean;
    onPlay(music: SearchMusic): void;
    onTogglePlay?: VoidFunction;
    onDownload?(music: SearchMusic, type: 'song' | 'lrc'): void;
    onSearch?(keyword: string): void;
}

function MusicPlayList({ show, data, onChange, current, playing, onPlay, onTogglePlay, onSearch, onDownload }: MusicPlayListProps) {

    const [keyword, setKeyword] = useState('')
    const { outlet, showMenu, hideMenu } = useMenu()
    const [rendered, setRendered] = useState(false)

    const pinToTop = (music: SearchMusic) => {
        onChange(
            list => [
                music,
                ...list.filter(
                    (item) => item.id !== music.id
                )
            ]
        )
    }

    const removeSong = (music: SearchMusic) => {
        if (music.id === current.id) {
            if (data.length > 1) {
                const playIndex = data.findIndex(
                    music => music.id === current.id
                );
                onPlay(
                    data[playIndex > 0 ? playIndex - 1 : playIndex + 1]
                )
            }
            else {
                onPlay(null)
            }
        }
        onChange(
            list => list.filter(
                item => item.id !== music.id
            )
        )
    }

    const clearPlayList = () => {
        onPlay(null)
        onChange([])
    }

    const validKeyword = useMemo(() => keyword.trim(), [keyword])

    const getMatch = (text: string) => {
        const pattern = new RegExp(validKeyword.replace(/\\/g, '\\\\'), 'gi');
        return {
            text,
            pattern,
            match: text.match(pattern)
        }
    }

    const getMatchResult = (source: [string, string]) => {
        return source.map(getMatch).map(
            ({ text, pattern, match }) => {
                if (match) {
                    const fragments = text.split(pattern);
                    const nodes: ReactNode[] = [];
                    for (let i = 0; i < fragments.length + match.length; i++) {
                        if (i % 2 === 0) {
                            const fragment = fragments[i / 2]
                            if (fragment !== '') {
                                nodes.push(
                                    <span key={i}>{fragment}</span>
                                )
                            }
                        }
                        else {
                            nodes.push(
                                <MatchText key={i}>{match[(i - 1) / 2]}</MatchText>
                            )
                        }
                    }
                    return {
                        match: true,
                        children: (
                            <>
                                {nodes}
                            </>
                        )
                    }
                }
                return {
                    match: false,
                    children: text
                }
            }
        )
    }

    const matchedList = useMemo<ListMatch[]>(() => {
        if (validKeyword === '') {
            return []
        }
        const matched = [];
        let hasMatched = false;
        for (const { id, name, artist } of data) {
            const [_name, _artist] = getMatchResult([name, artist]);
            let firstMatch = false;
            if ((_name.match || _artist.match) && !hasMatched) {
                firstMatch = true;
                hasMatched = true;
            }
            matched.push({
                id,
                name: _name.children,
                artist: _artist.children,
                firstMatch
            })
        }
        return matched;
    }, [data, keyword])

    useEffect(() => {
        if (show) {
            setRendered(true)
        }
    }, [show, rendered])

    if (!rendered) {
        return null;
    }

    return (
        <DarkThemed>
            <Stack sx={{
                display: show ? 'flex' : 'none',
                height: '50vh',
                bgcolor: 'background.paper',
                color: '#fff',
                overflowY: 'auto',
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'var(--scrollbar-thumb-dark-mode-color)'
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    bgcolor: 'var(--scrollbar-thumb-dark-mode-hover-color)'
                }
            }}>
                <List subheader={
                    <ListSubheader disableGutters component="li">
                        <Stack sx={{
                            pl: 2,
                            pr: 1,
                            py: .5
                        }} direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2">播放列表</Typography>
                            <Stack direction="row" alignItems="center" columnGap={1}>
                                <Stack sx={{
                                    px: 1,
                                    py: .5,
                                    bgcolor: '#ffffff10',
                                    borderRadius: 1
                                }} direction="row" alignItems="center" columnGap={1}>
                                    <SearchRoundedIcon fontSize="small" />
                                    <StyledInput
                                        placeholder="输入关键词搜索.."
                                        value={keyword}
                                        onChange={
                                            (event: React.ChangeEvent<HTMLInputElement>) => {
                                                setKeyword(event.target.value)
                                            }
                                        }
                                    />
                                </Stack>
                                <IconButton onClick={
                                    (event: MouseEvent<HTMLButtonElement>) => {
                                        showMenu(event.currentTarget, [
                                            {
                                                icon: <ClearAllRoundedIcon />,
                                                text: '清空播放列表',
                                                onClick: () => {
                                                    clearPlayList()
                                                    hideMenu()
                                                }
                                            }
                                        ]);
                                    }
                                }>
                                    <MoreVertRoundedIcon />
                                </IconButton>
                                {outlet}
                            </Stack>
                        </Stack>
                    </ListSubheader>
                } disablePadding dense>
                    {
                        data.map(
                            (music, index) => {
                                const isCurrentPlaying = music.id === current.id;
                                const match = matchedList.find(
                                    ({ id }) => id === music.id
                                )
                                return (
                                    <PlayListItem
                                        key={music.id}
                                        divider={index < data.length - 1}
                                        music={{
                                            ...music,
                                            match
                                        }}
                                        isCurrent={isCurrentPlaying}
                                        playing={playing}
                                        onClick={
                                            () => {
                                                if (isCurrentPlaying) {
                                                    onTogglePlay?.()
                                                }
                                                else {
                                                    onPlay(music)
                                                }
                                            }
                                        }
                                        onAction={
                                            (cmd: MenuAction, music: SearchMusic) => {
                                                switch (cmd) {
                                                    case 'pin':
                                                        pinToTop(music);
                                                        break;
                                                    case 'search-artist':
                                                        onSearch?.(music.artist);
                                                        break;
                                                    case 'search-name':
                                                        onSearch?.(music.name);
                                                        break;
                                                    case 'download-song':
                                                        onDownload?.(music, 'song');
                                                        break;
                                                    case 'download-lrc':
                                                        onDownload?.(music, 'lrc');
                                                        break;
                                                    case 'remove':
                                                        removeSong(music);
                                                        break;
                                                    default:
                                                        break;
                                                }
                                            }
                                        }
                                    />
                                )
                            }
                        )
                    }
                </List>
            </Stack>
        </DarkThemed>
    )
}

type MenuAction = 'pin' | 'search-artist' | 'search-name' | 'download-song' | 'download-lrc' | 'remove';

interface PlayListItemProps {
    music: SearchMusicWithMatch;
    playing: boolean;
    isCurrent: boolean;
    divider: boolean;
    onClick: MouseEventHandler<HTMLDivElement>;
    onAction(cmd: MenuAction, music: SearchMusicWithMatch): void;
}

function PlayListItem({ music, playing, isCurrent, divider, onAction, onClick }: PlayListItemProps) {

    const listItemRef = useRef<HTMLLIElement>()
    const { outlet, showMenu, hideMenu } = useMenu()

    const handleMenuAction = (cmd: MenuAction) => {
        return () => {
            onAction(cmd, music)
            hideMenu()
        }
    }

    const setScroll = () => {
        listItemRef.current.scrollIntoView({
            behavior: 'auto',
            block: 'center'
        })
    }

    useEffect(() => {
        if (isCurrent) {
            setScroll()
        }
    }, [])

    useEffect(() => {
        if (music.match?.firstMatch) {
            setScroll()
        }
    }, [music.match])

    return (
        <ListItem
            key={music.id}
            divider={divider}
            disablePadding
            ref={listItemRef}
            secondaryAction={
                <>
                    <IconButton onClick={
                        (event: MouseEvent<HTMLButtonElement>) => {
                            showMenu(event.currentTarget, [
                                {
                                    icon: <PublishRoundedIcon />,
                                    text: '置顶',
                                    onClick: handleMenuAction('pin')
                                },
                                {
                                    icon: <PlaylistRemoveRoundedIcon />,
                                    text: '移出播放列表',
                                    onClick: handleMenuAction('remove')
                                },
                                null,
                                {
                                    icon: <PersonSearchRoundedIcon />,
                                    text: `搜索“${music.artist}”`,
                                    onClick: handleMenuAction('search-artist')
                                },
                                {
                                    icon: <ManageSearchRoundedIcon />,
                                    text: `搜索“${music.name}”`,
                                    onClick: handleMenuAction('search-name')
                                },
                                null,
                                {
                                    icon: <DownloadRoundedIcon />,
                                    text: '下载歌曲',
                                    onClick: handleMenuAction('download-song')
                                },
                                {
                                    icon: <LyricsRoundedIcon />,
                                    text: '下载歌词',
                                    onClick: handleMenuAction('download-lrc')
                                }
                            ])
                        }
                    }>
                        <MoreVertRoundedIcon />
                    </IconButton>
                    {outlet}
                </>
            }
        >
            <ListItemButton onClick={onClick}>
                <Box sx={{
                    position: 'relative',
                    width: 45,
                    height: 45,
                    mr: 2
                }}>
                    <Box sx={{
                        height: '100%',
                        opacity: isCurrent ? .75 : 1
                    }}>
                        <MusicPoster
                            src={music.poster}
                            alt={`${music.name}-${music.artist}`}
                        />
                    </Box>
                    {
                        isCurrent && (
                            <Box sx={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}>
                                <MusicPlayIcon
                                    animating={playing}
                                />
                            </Box>
                        )
                    }
                </Box>
                <ListItemText
                    primary={music.match ? music.match.name : music.name}
                    secondary={music.match ? music.match.artist : music.artist}
                />
            </ListItemButton>
        </ListItem>
    )
}

export default MusicPlayList;
