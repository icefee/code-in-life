import React from 'react';
import GlobalStyles from '@mui/material/GlobalStyles';

export function Head() {
    return (
        <>
            <title>音乐搜索</title>
            <link rel="icon" type="image/svg+xml" href="/mmj/vite.svg" />
            <link rel="stylesheet" href="/mmj/assets/index-2e67895d.css" />
            <script dangerouslySetInnerHTML={{
                __html: `

                function loadScript() {
                    const script = document.createElement('script');
                    script.src = '/mmj/assets/index-5d3d4fa9.js';
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
