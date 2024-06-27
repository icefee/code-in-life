import React, { useState, useEffect, useMemo } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import List from '@mui/material/List'
import ListSubheader from '@mui/material/ListSubheader'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import DownloadIcon from '@mui/icons-material/Download'
import LyricsIcon from '@mui/icons-material/Lyrics'
import MusicPoster from '../player/MusicPoster'
import { MusicPlay as MusicPlayIcon } from '../loading'
import useMenu from '../hook/useMenu'

type MenuAction = 'add' | 'download-song' | 'download-lrc';

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

    useEffect(() => {
        setPage(1)
    }, [data])

    return (
        <List
            sx={({ shadows }) => ({
                bgcolor: 'background.paper',
                boxShadow: shadows[4]
            })}
            subheader={
                <ListSubheader
                    disableGutters
                    component="li"
                    sx={{
                        p: (theme) => theme.spacing(0, 1.5)
                    }}
                >
                    <Typography variant="button">搜索到{data.length}首歌曲</Typography>
                </ListSubheader>
            }
            disablePadding
        >
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
                    <ListItem disablePadding>
                        {
                            page < pages ? (
                                <ListItemButton
                                    sx={{
                                        p: 1.5,
                                        justifyContent: 'center'
                                    }}
                                    onClick={
                                        () => setPage(page => page + 1)
                                    }
                                >
                                    <Typography variant="button" color="secondary.main">加载更多</Typography>
                                </ListItemButton>
                            ) : (
                                <Stack
                                    direction="row"
                                    sx={{
                                        width: '100%',
                                        borderTop: '1px solid',
                                        borderColor: 'divider',
                                        p: 1.5,
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Typography variant="button" color="text.secondary">已加载全部</Typography>
                                </Stack>
                            )
                        }
                    </ListItem>
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
                    <IconButton
                        onClick={
                            (event: React.MouseEvent<HTMLButtonElement>) => {
                                showMenu(event.currentTarget, [
                                    {
                                        icon: <PlaylistAddIcon />,
                                        text: '加入播放列表',
                                        onClick: handleMenuAction('add')
                                    },
                                    null,
                                    {
                                        icon: <DownloadIcon />,
                                        text: '下载歌曲',
                                        onClick: handleMenuAction('download-song')
                                    },
                                    {
                                        icon: <LyricsIcon />,
                                        text: '下载歌词',
                                        onClick: handleMenuAction('download-lrc')
                                    }
                                ]);
                            }
                        }
                    >
                        <MoreVertIcon />
                    </IconButton>
                    {outlet}
                </>
            }
            divider={divider}
            disablePadding
        >
            <ListItemButton
                onClick={
                    () => onTogglePlay(current)
                }
            >
                <Box
                    sx={{
                        position: 'relative',
                        width: 48,
                        height: 48,
                        mr: 2,
                        flexShrink: 0,
                        color: '#fff'
                    }}
                >
                    <MusicPoster
                        src={current.poster}
                        alt={`${current.name}-${current.artist}`}
                    />
                    {
                        isCurrent && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
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

export default SongList