import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PublishIcon from '@mui/icons-material/Publish';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { type PlayingMusic } from './MusicPlayer';
import { DarkThemed } from '../../components/theme';
import MusicPoster from './MusicPoster';
import MusicPlayIcon from '../../components/loading/music';

interface MusicPlayListProps {
    data: PlayingMusic[];
    onChange: React.Dispatch<React.SetStateAction<PlayingMusic[]>>;
    current: PlayingMusic;
    onPlay(music: PlayingMusic): void;
    onTogglePlay?: VoidFunction;
    onDownload?(music: PlayingMusic): void;
    onSearch?(keyword: string): void;
}

function MusicPlayList({ data, onChange, current, onPlay, onTogglePlay, onSearch, onDownload }: MusicPlayListProps) {

    const pinToTop = (music: PlayingMusic) => {
        onChange(
            list => [
                music,
                ...list.filter(
                    (item) => item.id !== music.id
                )
            ]
        )
    }

    const removeSong = (music: PlayingMusic) => {
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

    return (
        <DarkThemed>
            <Box sx={{
                flexGrow: 1,
                bgcolor: 'background.paper',
                color: '#fff',
                overflowY: 'auto',
                borderTop: '1px solid #333'
            }}>
                <List subheader={
                    <ListSubheader component="li">播放列表</ListSubheader>
                } disablePadding dense>
                    {
                        data.map(
                            (music, index) => {
                                const isCurrentPlaying = music.id === current.id;
                                return (
                                    <PlayListItem
                                        key={music.id}
                                        divider={index < data.length - 1}
                                        music={music}
                                        isCurrent={isCurrentPlaying}
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
                                            (cmd: MenuAction, music: PlayingMusic) => {
                                                switch (cmd) {
                                                    case 'pin':
                                                        pinToTop(music);
                                                        break;
                                                    case 'search':
                                                        onSearch?.(music.artist)
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

type MenuAction = 'pin' | 'search' | 'download' | 'remove';

interface PlayListItemProps {
    music: PlayingMusic;
    isCurrent: boolean;
    divider: boolean;
    onClick: React.MouseEventHandler<HTMLDivElement>;
    onAction(cmd: MenuAction, music: PlayingMusic): void;
}

function PlayListItem({ music, isCurrent, divider, onAction, onClick }: PlayListItemProps) {

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null)
    const listItemRef = useRef<HTMLLIElement>()

    const handleMenuAction = (cmd: MenuAction) => {
        return (_event: React.SyntheticEvent) => {
            onAction(cmd, music)
            setAnchorEl(null)
        }
    }

    useEffect(() => {
        if (isCurrent) {
            listItemRef.current.scrollIntoView({
                behavior: 'auto',
                block: 'center'
            })
        }
    }, [])

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
                        <MenuItem onClick={handleMenuAction('search')}>
                            <ListItemIcon>
                                <SearchIcon />
                            </ListItemIcon>
                            <ListItemText>搜索“{music.artist}”</ListItemText>
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
                    <MusicPoster
                        src={music.poster}
                        alt={`${music.name}-${music.artist}`}
                    />
                    {
                        isCurrent && (
                            <Box sx={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}>
                                <MusicPlayIcon
                                    sx={{
                                        display: 'block',
                                        fontSize: 18
                                    }}
                                />
                            </Box>
                        )
                    }
                </Box>
                <ListItemText
                    primary={music.name}
                    secondary={music.artist}
                />
            </ListItemButton>
        </ListItem>
    )
}

export default MusicPlayList;
