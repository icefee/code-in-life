import React from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function Page404() {
    return (
        <Stack
            sx={{
                height: '100%'
            }}
            justifyContent="center"
            alignItems="center"
        >
            <Typography variant="h4">Page not found.</Typography>
        </Stack>
    )
}
