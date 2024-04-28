import React from 'react'
import Box from '@mui/material/Box'

interface TabPanelProps extends React.PropsWithChildren<{
    index: number;
    value: number;
    disablePadding?: boolean;
}> { }

function TabPanel({ index, value, disablePadding = false, children }: TabPanelProps) {
    if (index === value) {
        return (
            <Box sx={{
                width: '100%',
                flexGrow: 1,
                p: disablePadding ? 0 : 1.5,
                bgcolor: 'background.default',
                overflow: 'hidden',
            }}>{children}</Box>
        )
    }
    return null;
}

export default TabPanel
