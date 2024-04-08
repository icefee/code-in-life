import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function NoData({ text = '😭 没有找到符合的内容.' }: { text?: string; }) {
    return (
        <Box
            sx={{
                display: 'flex',
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2
            }}
        >
            <Typography variant="body1" color="inherit">{text}</Typography>
        </Box>
    )
}