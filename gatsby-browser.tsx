import React from 'react'
import type { GatsbyBrowser } from 'gatsby'
import { StaticTheme } from './src/components/theme'
import { SnackbarProvider } from './src/components/hook/useSnackbar'
import './src/global.css'

export const wrapPageElement: GatsbyBrowser['wrapPageElement'] = ({
    element,
}) => (
    <StaticTheme>
        <SnackbarProvider>
            {element}
        </SnackbarProvider>
    </StaticTheme>
)