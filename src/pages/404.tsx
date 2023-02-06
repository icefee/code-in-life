import React from 'react';
import { Link } from 'gatsby';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


export function Head() {
    return (
        <title>内容不存在</title>
    )
}

const Page404 = () => (
    <Box
        component="main"
        sx={{
            alignItems: 'center',
            display: 'flex',
            flexGrow: 1,
            minHeight: '100%'
        }}
    >
        <Container maxWidth="md">
            <Box
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Typography
                    align="center"
                    color="textPrimary"
                    variant="h2"
                    sx={(theme) => ({
                        mb: 6,
                        [theme.breakpoints.down('sm')]: {
                            mb: 3,
                            fontSize: 40
                        }
                    })}
                >
                    访问的内容不存在
                </Typography>
                <Box sx={{
                    textAlign: 'center',
                    mb: 3
                }}>
                    <img
                        alt="page not found"
                        src="/assets/page_not_found.svg"
                        // priority
                        width={537}
                        height={292}
                        style={{
                            display: 'inline-block',
                            maxWidth: '100%',
                        }}
                    />
                </Box>
                <Link
                    to="/"
                    style={{
                        textDecoration: 'none'
                    }}
                >
                    <Button
                        startIcon={
                            <ArrowBackIcon fontSize="small" />
                        }
                        variant="contained"
                        onClick={
                            () => history.back()
                        }
                    >
                        返回上一页
                    </Button>
                </Link>
            </Box>
        </Container>
    </Box>
)

export default Page404;
