import React from 'react';
import NoSsr from '@mui/material/NoSsr';
import GlobalStyles from '@mui/material/GlobalStyles';

export function Head() {
    return (
        <>
            <meta charSet="UTF-8" />
            <link rel="icon" type="image/svg+xml" href="/mmj/vite.svg" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="stylesheet" type="text/css" href="/mmj/assets/index-cadd242c.css" />
            <script type="module" src="/mmj/assets/index-8afe445e.js"></script>
            <title>音乐搜索</title>
        </>
    )
}

function Page() {
    return (
        <NoSsr>
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
