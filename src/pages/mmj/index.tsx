import React from 'react';
import NoSsr from '@mui/material/NoSsr';
import GlobalStyles from '@mui/material/GlobalStyles';

export function Head() {
    return (
        <>
            <link rel="icon" type="image/svg+xml" href="/mmj/vite.svg" />
            <link rel="stylesheet" type="text/css" href="/mmj/assets/index-cadd242c.css" />
            <title>音乐搜索</title>
        </>
    )
}

function Page() {
    return (
        <NoSsr>
            <script type="module" src="/mmj/assets/index-8afe445e.js"></script>
            <GlobalStyles
                styles={
                    `
                    #___gatsby {
                        width: 100%;
                    }
                    `
                }
            />
            <div id="app"></div>
        </NoSsr>
    )
}

export default Page;
