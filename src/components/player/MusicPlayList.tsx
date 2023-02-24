import React, { useState, useMemo, useRef } from 'react';
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
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PublishIcon from '@mui/icons-material/Publish';
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
}

function MusicPlayList({ data, onChange, current, onPlay }: MusicPlayListProps) {

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null)
    const editingMusic = useRef<PlayingMusic>()

    const pinToTop = () => {
        const music = editingMusic.current;
        onChange(
            list => list.sort(
                (prev) => prev.id === music.id ? -1 : 0
            )
        )
        setAnchorEl(null)
    }

    const removeSong = () => {
        const music = editingMusic.current;
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
        setAnchorEl(null)
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
                                    <ListItem
                                        key={music.id}
                                        divider={index < data.length - 1}
                                        disablePadding
                                        secondaryAction={
                                            <>
                                                <IconButton onClick={
                                                    (event: React.MouseEvent<HTMLButtonElement>) => {
                                                        editingMusic.current = music;
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
                                                            editingMusic.current = null
                                                        }
                                                    }
                                                >
                                                    <MenuItem onClick={pinToTop}>
                                                        <ListItemIcon>
                                                            <PublishIcon />
                                                        </ListItemIcon>
                                                        <ListItemText>置顶</ListItemText>
                                                    </MenuItem>
                                                    <MenuItem onClick={removeSong}>
                                                        <ListItemIcon>
                                                            <DeleteOutlineIcon />
                                                        </ListItemIcon>
                                                        <ListItemText>移除</ListItemText>
                                                    </MenuItem>
                                                </Menu>
                                            </>
                                        }
                                    >
                                        <ListItemButton
                                            onClick={
                                                () => {
                                                    if (!isCurrentPlaying) {
                                                        onPlay(music)
                                                    }
                                                }
                                            }
                                        >
                                            <Box sx={{
                                                position: 'relative',
                                                width: 45,
                                                height: 45,
                                                mr: 2
                                            }}>
                                                <MusicPoster
                                                    src={music.poster}
                                                    placeholder={
                                                        !music.poster && !isCurrentPlaying && <MusicNoteIcon />
                                                    }
                                                />
                                                {
                                                    isCurrentPlaying && (
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
                        )
                    }
                </List>
            </Box>
        </DarkThemed>
    )
}

export default MusicPlayList;
