import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles'

const DarkThemed = ({ children }: React.PropsWithChildren<unknown>) => {
    return (
        <ThemeProvider theme={createTheme({
            palette: {
                mode: 'dark',
            },
        })}>{children}</ThemeProvider>
    )
}

export default DarkThemed;
