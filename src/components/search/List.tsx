import React, { useState, useMemo, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import ThumbLoader from './ThumbLoader';
import RowClipTypography from '../layout/element/RowClipTypography';
import { image } from '../../util/parser';
import type { VideoListItem } from './api';

type ListData = VideoListItem[];

type ListProps = {
    data: ListData;
    api: string;
    onClick?: (arg: VideoListItem) => void;
    typed?: boolean;
}

export function SearchList({ data, api, typed = false }: ListProps) {
    return (
        <Grid spacing={2} container>
            {
                data.map(
                    (dataItem) => (
                        <Grid xs={12} sm={6} lg={4} xl={3} key={dataItem.id} item>
                            <VideoItem
                                video={dataItem}
                                api={api}
                                typed={typed}
                            />
                        </Grid>
                    )
                )
            }
        </Grid>
    )
}

function usePosterUrl(api: string, id: number) {
    const [poster, setPoster] = useState(null)
    useEffect(() => {
        const getPoster = async () => {
            const parsedPoster = await fetch(`/video/poster/?api=${api}&id=${id}`).then(image)
            if (parsedPoster) {
                setPoster(parsedPoster)
            }
            else {
                getPoster()
            }
        }
        getPoster()
    }, [])
    return poster;
}

interface VideoItemProps extends Pick<ListProps, 'api' | 'typed'> {
    video: VideoListItem;
}

function VideoItem({ video, api, typed }: VideoItemProps) {

    const poster = usePosterUrl(api, video.id)
    const videoUrl = useMemo(() => `/video/?api=${api}&id=${video.id}`, [api, video.id])

    return (
        <Card elevation={2}>
            <Stack direction="row">
                <CardActionArea sx={{
                    width: 125,
                    height: 180,
                    flexShrink: 0
                }} href={videoUrl} target="_blank">
                    {
                        poster ? (
                            <ThumbLoader
                                src={poster}
                                aspectRatio="125 / 180"
                                fill
                                alt={video.name}
                                errorText="缩略图加载失败"
                            />
                        ) : (
                            <Skeleton sx={{
                                width: '100%',
                                height: '100%'
                            }} animation="wave" variant="rectangular" />
                        )
                    }
                </CardActionArea>
                <Box sx={{
                    flexGrow: 1,
                    p: 1.5,
                    overflow: 'hidden'
                }}>
                    <Stack sx={{
                        height: '100%'
                    }}>
                        <Box sx={{
                            flexGrow: 1
                        }}>
                            <Link underline="hover" href={videoUrl} target="_blank">
                                <RowClipTypography
                                    lineHeight={1.2}
                                    rows={2}
                                    variant="h5"
                                    paragraph
                                >{video.name}</RowClipTypography>
                            </Link>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Chip
                                    label={video.type}
                                    color="primary"
                                    variant="outlined"
                                />
                                <Typography variant="body1" color="text.secondary">{video.note}</Typography>
                            </Stack>
                        </Box>
                        <Typography variant="subtitle2" color="text.secondary" align="right">{video.last}</Typography>
                    </Stack>
                </Box>
            </Stack>
        </Card>
    )
}
