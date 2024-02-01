import React, { useState, useMemo, type MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import PlaylistAddRoundedcon from '@mui/icons-material/PlaylistAdd';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import LyricsRoundedIcon from '@mui/icons-material/LyricsRounded';
import MusicPoster from '../player/MusicPoster';
import { MusicPlay as MusicPlayIcon } from '../loading';
import useMenu from '../hook/useMenu';

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

    const pageSize = 20
    const pages = Math.ceil(data.length / pageSize)
    const [page, setPage] = useState(1)

    const renderData = useMemo(() => data.slice(0, Math.min(page * pageSize, data.length)), [data, page])

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
                        color="secondary"
                        startIcon={<PlaylistAddRoundedcon />}
                        onClick={
                            () => onAction('add-all')
                        }
                    >加入播放列表</Button>
                </Stack>
            </ListSubheader>
        }>
            {
                renderData.map(
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
            {
                pages > 1 && (
                    <Stack
                        direction="row"
                        justifyContent="center"
                        sx={{
                            p: (theme) => theme.spacing(1, 1, 0)
                        }}
                    >
                        {
                            page < pages ? (
                                <Button
                                    onClick={
                                        () => setPage(page => page + 1)
                                    }
                                >加载更多</Button>
                            ) : (
                                <Typography variant="button" color="text.secondary">已显示全部</Typography>
                            )
                        }
                    </Stack>
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

    const { outlet, showMenu, hideMenu } = useMenu()
    const { isCurrent, playing } = isCurrentPlaying(current)

    const handleMenuAction = (cmd: MenuAction) => {
        return () => {
            onAction(cmd, current)
            hideMenu()
        }
    }

    return (
        <ListItem
            secondaryAction={
                <>
                    <IconButton onClick={
                        (event: MouseEvent<HTMLButtonElement>) => {
                            showMenu(event.currentTarget, [
                                {
                                    icon: <PlaylistAddRoundedcon />,
                                    text: '加入播放列表',
                                    onClick: handleMenuAction('add')
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
