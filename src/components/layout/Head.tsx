import React from 'react'
import { Api } from '~/util/config'

function Head({ children }: React.PropsWithChildren) {
  return (
    <>
      <meta name="referrer" content="no-referrer" />
      <meta
        name="viewport"
        content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
      />
      <style>
        {`
          .image-container {
            height: 100%;
            background-image: url(${Api.assetSite}/api/image/bing);
            background-size: cover;
          }
          @media screen and (prefers-color-scheme: dark) {
            .image-container {
              background-color: #0009;
              background-blend-mode: color;
            }
          }
        `}</style>
      {children}
    </>
  )
}

export default Head