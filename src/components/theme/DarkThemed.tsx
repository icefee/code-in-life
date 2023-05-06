import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
})

const DarkThemed = ({ children, enableCssBaseline = false }: React.PropsWithChildren<{
    enableCssBaseline?: boolean
}>) => {
    return (
        <ThemeProvider theme={darkTheme}>
            {
                enableCssBaseline && <CssBaseline enableColorScheme />
            }
            {children}
        </ThemeProvider>
    )
}

export default DarkThemed;
