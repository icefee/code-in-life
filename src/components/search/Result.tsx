import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Rating from '@mui/material/Rating';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { SearchList } from './List';
import NoData from './NoData';

interface SearchResultProps {
    keyword: string;
    videoList: SearchVideo[];
}

function SearchResult({ keyword, videoList }: SearchResultProps) {
    return (
        <Box sx={{
            position: 'relative',
            height: '100%'
        }}>
            {
                videoList.length > 0 ? videoList.map(
                    ({ key, name, rating, data, page }) => (
                        <List key={key} sx={{
                            bgcolor: 'transparent'
                        }} component="div" subheader={
                            <ListSubheader
                                component="div"
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    bgcolor: 'transparent',
                                    color: '#fff',
                                    pl: 4,
                                    py: 1,
                                    backdropFilter: 'blur(2px)',
                                    '&::before': {
                                        content: '""',
                                        bgcolor: '#fff',
                                        position: 'absolute',
                                        left: 12,
                                        top: 'calc(50% - 8px)',
                                        width: 5,
                                        height: 16
                                    }
                                }} color="primary">
                                <Stack direction="row" alignItems="center" columnGap={1}>
                                    <Typography>{name}</Typography>
                                    <Rating
                                        defaultValue={rating}
                                        precision={.5}
                                        size="small"
                                        readOnly
                                    />
                                </Stack>
                                <Button
                                    LinkComponent="a"
                                    href={`/video/${key}/`}
                                    target="_blank"
                                    size="small"
                                    color="inherit"
                                    startIcon={
                                        <ManageSearchIcon />
                                    }
                                >站内查询</Button>
                            </ListSubheader>
                        }>
                            <Box sx={(theme) => ({
                                p: theme.spacing(1, 1.5, 2.5)
                            })}>
                                <SearchList
                                    data={data}
                                    api={key}
                                />
                            </Box>
                            {
                                page.pagecount > 1 && (
                                    <Box sx={(theme) => ({
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        p: theme.spacing(0, 2, 2),
                                        color: '#fff'
                                    })}>
                                        <Button
                                            LinkComponent="a"
                                            variant="outlined"
                                            color="inherit"
                                            endIcon={
                                                <ArrowForwardIosIcon />
                                            }
                                            href={'/video/' + key + '?s=' + keyword + '&p=2'}
                                            target="_blank"
                                        >更多</Button>
                                    </Box>
                                )
                            }
                        </List>
                    )
                ) : (
                    <Box sx={{
                        position: 'absolute',
                        zIndex: 1,
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0
                    }}>
                        <NoData />
                    </Box>
                )
            }
        </Box>
    )
}


export default SearchResult;
