import React from 'react'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import HomeIcon from '@mui/icons-material/Home'

export function Head() {
    return (
        <>
            <title key="404">内容不存在</title>
        </>
    )
}

const Page404 = () => (
    <Stack
        component="main"
        direction="row"
        alignItems="center"
        sx={{
            height: '100%'
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
                    sx={({ breakpoints }) => ({
                        mb: 6,
                        [breakpoints.down('sm')]: {
                            mb: 3,
                            fontSize: 40
                        }
                    })}
                >
                    访问的内容不存在
                </Typography>
                <Box
                    sx={{
                        textAlign: 'center',
                        mb: 3
                    }}
                >
                    <img
                        alt="page not found"
                        src="/page_not_found.svg"
                        width={537}
                        height={292}
                        style={{
                            display: 'inline-block',
                            maxWidth: '100%',
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        color: '#6c63ff'
                    }}
                >
                    <Button
                        startIcon={
                            <HomeIcon />
                        }
                        href="/"
                        color="inherit"
                        variant="outlined"
                    >
                        返回主页
                    </Button>
                </Box>
            </Box>
        </Container>
    </Stack>
)

export default Page404