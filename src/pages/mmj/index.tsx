import React from 'react';
import GlobalStyles from '@mui/material/GlobalStyles';
import { Script } from 'gatsby';

export function Head() {
    return (
        <>
            <title>音乐搜索</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no" />
            <link rel="stylesheet" href="/mmj/css/_element-plus-16558732.css" />
            <link rel="stylesheet" href="/mmj/css/index-72a7f938.css" />

            <Script defer dangerouslySetInnerHTML={{
                __html: `

                function loadScript() {
                    const script = document.createElement('script');
                    script.src = '/mmj/js/index-30d022c1.js';
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

export async function config() {
    return ({ params }) => {
        return {
            defer: true,
        }
    }
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
