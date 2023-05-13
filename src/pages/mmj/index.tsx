import React from 'react';
import GlobalStyles from '@mui/material/GlobalStyles';
import { Script } from 'gatsby';

export function Head() {
    return (
        <>
            <title>音乐搜索</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no" />
            <link rel="modulepreload" href="/mmj/js/_@vue-e00bfe83.js" />
            <link rel="modulepreload" href="/mmj/js/_@element-plus-0c795a89.js" />
            <link rel="modulepreload" href="/mmj/js/__vendor-6a03e462.js" />
            <link rel="modulepreload" href="/mmj/js/_@popperjs-c45de710.js" />
            <link rel="modulepreload" href="/mmj/js/_element-plus-9fd6eb85.js" />
            <link rel="stylesheet" href="/mmj/css/_element-plus-16558732.css" />
            <link rel="stylesheet" href="/mmj/css/index-696d273f.css"></link>

            <Script defer dangerouslySetInnerHTML={{
                __html: `

                function loadScript() {
                    const script = document.createElement('script');
                    script.src = '/mmj/js/index-dd15ea96.js';
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
