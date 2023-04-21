import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
})

const DarkThemed = ({ children }: React.PropsWithChildren) => {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline enableColorScheme>
                {children}
            </CssBaseline>
        </ThemeProvider>
    )
}

export default DarkThemed;
