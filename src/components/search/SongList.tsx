import React, { useState, type SyntheticEvent, type MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DownloadIcon from '@mui/icons-material/Download';
import RttOutlinedIcon from '@mui/icons-material/RttOutlined';
import MusicPoster from '../player/MusicPoster';
import MusicPlayIcon from '../loading/music';

type MenuAction = 'add' | 'add-all' | 'download-song' | 'download-lrc';

interface SongListProps {
    data: SearchMusic[];
    onTogglePlay(music: SearchMusic): void;
    isCurrentPlaying(music: SearchMusic): {
        isCurrent: boolean;
        playing: boolean;
    };
    onAction(cmd: MenuAction, current?: SearchMusic): void;
}

function SongList({ data, onAction, ...rest }: SongListProps) {

    return (
        <List sx={{
            bgcolor: 'background.paper'
        }} subheader={
            <ListSubheader disableGutters component="li">
                <Stack sx={{
                    p: (theme) => theme.spacing(1, 1, 1, 1.5)
                }} direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="button">搜索到{data.length}首歌曲</Typography>
                    <Button
                        size="small"
                        startIcon={<PlaylistAddIcon />}
                        onClick={
                            () => onAction('add-all')
                        }
                    >加入播放列表</Button>
                </Stack>
            </ListSubheader>
        }>
            {
                data.map(
                    (music, index) => (
                        <SongListItem
                            key={music.id}
                            divider={index < data.length - 1}
                            current={music}
                            onAction={onAction}
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

function SongListItem({ current, divider, isCurrentPlaying, onTogglePlay, onAction }: SongListItemProps) {

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null)
    const { isCurrent, playing } = isCurrentPlaying(current)

    const handleMenuAction = (cmd: MenuAction) => {
        return (_event: SyntheticEvent) => {
            onAction(cmd, current)
            setAnchorEl(null)
        }
    }

    return (
        <ListItem
            secondaryAction={
                <React.Fragment>
                    <IconButton onClick={
                        (event: MouseEvent<HTMLButtonElement>) => {
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
                        <MenuItem onClick={handleMenuAction('download-song')}>
                            <ListItemIcon>
                                <DownloadIcon />
                            </ListItemIcon>
                            <ListItemText>下载歌曲</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleMenuAction('download-lrc')}>
                            <ListItemIcon>
                                <RttOutlinedIcon />
                            </ListItemIcon>
                            <ListItemText>下载歌词</ListItemText>
                        </MenuItem>
                    </Menu>
                </React.Fragment>
            }
            divider={divider}
            disablePadding
        >
            <ListItemButton onClick={
                () => onTogglePlay(current)
            }>
                <Box sx={{
                    position: 'relative',
                    width: 48,
                    height: 48,
                    mr: 2,
                    flexShrink: 0,
                    color: '#fff'
                }}>
                    <MusicPoster
                        src={current.poster}
                        alt={`${current.name}-${current.artist}`}
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
                                    animating={playing}
                                />
                            </Box>
                        )
                    }
                </Box>
                <ListItemText
                    primary={current.name}
                    primaryTypographyProps={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                    secondary={current.artist}
                />
            </ListItemButton>
        </ListItem>
    )
}

export default SongList;
