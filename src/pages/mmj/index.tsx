import React from 'react';
import GlobalStyles from '@mui/material/GlobalStyles';

export function Head() {
    return (
        <>
            <title>音乐搜索</title>
            <link rel="icon" type="image/svg+xml" href="/mmj/vite.svg" />
            <link rel="stylesheet" href="/mmj/assets/index-36fb1412.css" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no" />
            <script dangerouslySetInnerHTML={{
                __html: `

                function loadScript() {
                    const script = document.createElement('script');
                    script.src = '/mmj/assets/index-c74e0cd8.js';
                    script.type = 'module';
                    script.crossorigin = 'anonymous';
                    document.head.appendChild(script);
                }

                setTimeout(loadScript, 200)
                `
            }} />
        </>
    )
}

function Page() {
    return (
        <>
            <GlobalStyles styles={
                `
            #___gatsby {
                width: 100%
            }
            `
            } />
            <div id="app" />
        </>
    )
}

export default Page;
