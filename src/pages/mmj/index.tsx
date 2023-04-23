import React from 'react';
import GlobalStyles from '@mui/material/GlobalStyles';

export function Head() {
    return (
        <>
            <title>音乐搜索</title>
            <link rel="icon" type="image/svg+xml" href="/mmj/vite.svg" />
            <link rel="stylesheet" href="/mmj/assets/index-cadd242c.css" />
            <script dangerouslySetInnerHTML={{
                __html: `

                function loadScript() {
                    const script = document.createElement('script');
                    script.src = '/mmj/assets/index-8afe445e.js';
                    script.type = 'module';
                    script.crossorigin = 'anonymous';
                    document.head.appendChild(script);
                }

                loadScript()
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
