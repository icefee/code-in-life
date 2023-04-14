import React, { useState, useEffect, useRef, useMemo, ReactNode } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PublishIcon from '@mui/icons-material/Publish';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { type SearchMusic } from './MusicPlayer';
import { DarkThemed } from '../theme';
import MusicPoster from './MusicPoster';
import MusicPlayIcon from '../loading/music';

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
    data: SearchMusic[];
    onChange: React.Dispatch<React.SetStateAction<SearchMusic[]>>;
    current: SearchMusic;
    playing: boolean;
    onPlay(music: SearchMusic): void;
    onTogglePlay?: VoidFunction;
    onDownload?(music: SearchMusic): void;
    onSearch?(keyword: string): void;
}

function MusicPlayList({ data, onChange, current, playing, onPlay, onTogglePlay, onSearch, onDownload }: MusicPlayListProps) {

    const [keyword, setKeyword] = useState('')

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

    const validKeyword = useMemo(() => keyword.trimStart().trimEnd(), [keyword])

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

    return (
        <DarkThemed>
            <Box sx={{
                flexGrow: 1,
                bgcolor: 'background.paper',
                color: '#fff',
                overflowY: 'auto',
                borderTop: (theme) => `1px solid ${theme.palette.divider}`
            }}>
                <List subheader={
                    <ListSubheader disableGutters component="li">
                        <Stack sx={{
                            pl: 2,
                            py: .5
                        }} direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2">播放列表</Typography>
                            <Stack sx={{
                                px: 1,
                                py: .5,
                                bgcolor: '#ffffff10',
                                borderRadius: 1
                            }} direction="row" alignItems="center" columnGap={1}>
                                <SearchIcon fontSize="small" />
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
                                                        onSearch?.(music.artist)
                                                        break;
                                                    case 'search-name':
                                                        onSearch?.(music.name)
                                                        break;
                                                    case 'download':
                                                        onDownload?.(music);
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
            </Box>
        </DarkThemed>
    )
}

type MenuAction = 'pin' | 'search-artist' | 'search-name' | 'download' | 'remove';

interface PlayListItemProps {
    music: SearchMusicWithMatch;
    playing: boolean;
    isCurrent: boolean;
    divider: boolean;
    onClick: React.MouseEventHandler<HTMLDivElement>;
    onAction(cmd: MenuAction, music: SearchMusicWithMatch): void;
}

function PlayListItem({ music, playing, isCurrent, divider, onAction, onClick }: PlayListItemProps) {

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null)
    const listItemRef = useRef<HTMLLIElement>()

    const handleMenuAction = (cmd: MenuAction) => {
        return (_event: React.SyntheticEvent) => {
            onAction(cmd, music)
            setAnchorEl(null)
        }
    }

    useEffect(() => {
        if (isCurrent || music.match?.firstMatch) {
            listItemRef.current.scrollIntoView({
                behavior: 'auto',
                block: 'center'
            })
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
                        (event: React.MouseEvent<HTMLButtonElement>) => {
                            setAnchorEl(event.currentTarget);
                        }
                    }>
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        onClose={
                            () => {
                                setAnchorEl(null)
                            }
                        }
                    >
                        <MenuItem onClick={handleMenuAction('pin')}>
                            <ListItemIcon>
                                <PublishIcon />
                            </ListItemIcon>
                            <ListItemText>置顶</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleMenuAction('search-artist')}>
                            <ListItemIcon>
                                <PersonSearchOutlinedIcon />
                            </ListItemIcon>
                            <ListItemText>搜索“{music.artist}”</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleMenuAction('search-name')}>
                            <ListItemIcon>
                                <ManageSearchOutlinedIcon />
                            </ListItemIcon>
                            <ListItemText>搜索“{music.name}”</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleMenuAction('download')}>
                            <ListItemIcon>
                                <DownloadIcon />
                            </ListItemIcon>
                            <ListItemText>下载</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleMenuAction('remove')}>
                            <ListItemIcon>
                                <DeleteOutlineIcon />
                            </ListItemIcon>
                            <ListItemText>移除</ListItemText>
                        </MenuItem>
                    </Menu>
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
