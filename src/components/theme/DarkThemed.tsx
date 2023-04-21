import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
})

const DarkThemed = ({ children }: React.PropsWithChildren) => {
    return (
        <ThemeProvider theme={darkTheme}>
            {children}
        </ThemeProvider>
    )
}

export default DarkThemed;
