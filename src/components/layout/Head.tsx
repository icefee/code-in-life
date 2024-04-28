import React from 'react'

function Head({ children }: React.PropsWithChildren) {
    return (
        <>
            <meta charSet="utf-8" />
            <meta httpEquiv="x-ua-compatible" content="ie=edge" />
            <meta
                name="viewport"
                content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
            />
            <meta name="referrer" content="no-referrer" />
            {children}
        </>
    )
}

export default Head