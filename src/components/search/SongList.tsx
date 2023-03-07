import React, { useState, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DownloadIcon from '@mui/icons-material/Download';
import { SearchMusic } from '../player/MusicPlayer';

type MenuAction = 'add' | 'download';

interface SongListProps {
    data: SearchMusic[];
    playButton: ((current: SearchMusic) => React.ReactElement) | React.ReactElement;
    onAction(cmd: MenuAction, current: SearchMusic): void;
}

function SongList({ data, ...rest }: SongListProps) {

    return (
        <List sx={{
            bgcolor: 'background.paper'
        }}>
            {
                data.map(
                    (music, index) => (
                        <SongListItem
                            key={music.id}
                            divider={index < data.length - 1}
                            current={music}
                            {...rest}
                        />
                    )
                )
            }
        </List>
    )
}

interface SongListItemProps extends Omit<SongListProps, 'data'> {
    current: SearchMusic;
    divider: boolean;
}

function SongListItem({ current, divider, playButton, onAction }: SongListItemProps) {

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null)
    const [poster, setPoster] = useState('var(--linear-gradient-image)')

    useEffect(() => {
        const posterUrl = `/api/music/poster?id=${current.id}`;
        const loadPoster = () => {
            const image = new Image()
            image.src = posterUrl;
            image.onload = () => {
                setPoster(`url(${posterUrl})`)
            }
        }
        loadPoster()
    }, [current.id])

    const handleMenuAction = (cmd: MenuAction) => {
        return (_event: React.SyntheticEvent) => {
            onAction(cmd, current)
            setAnchorEl(null)
        }
    }

    return (
        <ListItem
            secondaryAction={
                <React.Fragment>
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
                        <MenuItem onClick={handleMenuAction('add')}>
                            <ListItemIcon>
                                <PlaylistAddIcon />
                            </ListItemIcon>
                            <ListItemText>加入播放列表</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleMenuAction('download')}>
                            <ListItemIcon>
                                <DownloadIcon />
                            </ListItemIcon>
                            <ListItemText>下载</ListItemText>
                        </MenuItem>
                    </Menu>
                </React.Fragment>
            }
            divider={divider}
        >
            <ListItemAvatar>
                <Avatar sx={{
                    backgroundImage: poster,
                    backgroundSize: 'cover'
                }}>{typeof playButton === 'function' ? playButton(current) : playButton}</Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={current.name}
                primaryTypographyProps={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}
                secondary={current.artist}
            />
        </ListItem>
    )
}

export default SongList;
