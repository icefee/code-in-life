import React from 'react';
import Box from '@mui/material/Box';

interface TabPanelProps extends React.PropsWithChildren<{
    index: number;
    value: number;
}> { }

function TabPanel({ index, value, children }: TabPanelProps) {
    if (index === value) {
        return (
            <Box sx={{
                width: '100%',
                flexGrow: 1,
                p: 1,
                bgcolor: 'background.default',
                overflow: 'hidden',
            }}>{children}</Box>
        )
    }
    return null;
}

export default TabPanel;
