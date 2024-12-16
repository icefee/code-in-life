import React from 'react'
import { Api } from '~/util/config'

function Head({ children }: React.PropsWithChildren) {
  return (
    <>
      <meta name="referrer" content="no-referrer" />
      <style>
        {
          `
          .image-container {
            height: 100%;
            background-image: url(${Api.proxyUrl}/api/image/bing);
            background-size: cover;
          }
          @media screen and (prefers-color-scheme: dark) {
            .image-container {
              background-color: #0009;
              background-blend-mode: color;
            }
          }
          `
        }</style>
      {children}
    </>
  )
}

export default Head