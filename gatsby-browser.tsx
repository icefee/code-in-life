import React from 'react'
import type { GatsbyBrowser } from 'gatsby'
import './src/global.css'
import { StaticTheme } from './src/components/theme'

export const wrapPageElement: GatsbyBrowser['wrapPageElement'] = ({
    element,
}) => (
    <StaticTheme>
        {element}
    </StaticTheme>
)