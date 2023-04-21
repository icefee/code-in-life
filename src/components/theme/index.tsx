import React, { useMemo, useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles'
import { useLocalStorage } from 'react-use';
import CssBaseline from '@mui/material/CssBaseline';
import { darkTheme } from './DarkThemed';
export { default as DarkThemed } from './DarkThemed';

export type ThemeMode = {
    themeMode?: boolean;
    setThemeMode?(arg: boolean | null): void;
}

export interface ThemeStoragerProps {
    children: ((arg: ThemeMode) => React.ReactNode) | React.ReactNode;
}

const useOsTheme = () => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
    return prefersDarkMode;
}

export const ThemeStorager: React.FC<ThemeStoragerProps> = ({ children }) => {
    const theme = useTheme<Theme>();
    const [themeMode, setThemeMode] = useState<boolean | null>(null);
    const [storage, setStorage] = useLocalStorage<boolean>('__dark_theme', null);
    const osTheme = useOsTheme();

    useEffect(
        () => setThemeMode(storage),
        []
    )

    useEffect(
        () => setStorage(themeMode),
        [themeMode]
    )

    useEffect(
        () => {
            const theme = (themeMode === null ? osTheme : themeMode) ? 'dark' : 'light';
            document.body.classList.add('theme-' + theme);
            return () => {
                document.body.classList.remove('theme-' + theme);
            }
        },
        [osTheme, themeMode]
    )

    const displayTheme = useMemo<Theme>(() => {
        const isDark = themeMode === null ? osTheme : themeMode;
        if (isDark) {
            return darkTheme;
        }
        return theme;
    }, [theme, themeMode, osTheme])

    return (
        <ThemeProvider theme={displayTheme}>
            <CssBaseline enableColorScheme />
            {typeof children === 'function' ? children({
                themeMode,
                setThemeMode
            } as ThemeMode) : children}
        </ThemeProvider>
    )
}

type ThemeChildren<T> = T | T[];

export const StaticTheme: React.FC<{
    children: ((darkMode: boolean) => ThemeChildren<React.ReactNode>) | ThemeChildren<React.ReactNode>;
}> = ({ children }) => {
    const osTheme = useOsTheme();
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: osTheme ? 'dark' : 'light',
                },
            }),
        [osTheme],
    )
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme />
            {typeof children === 'function' ? children(osTheme) : children}
        </ThemeProvider>
    )
}
