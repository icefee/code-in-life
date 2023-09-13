import type { GatsbyConfig } from 'gatsby'
import adapter from 'gatsby-adapter-netlify'

const config: GatsbyConfig = {
  adapter: adapter(),
  flags: {
    DEV_SSR: true
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: '应用中心',
        short_name: '应用中心',
        icon: 'static/icon.png',
        start_url: '/?mode=pwa',
        background_color: '#03a9f4',
        theme_color: '#3f51b5',
        display: 'standalone',
        cache_busting_mode: 'none'
      }
    },
    {
      resolve: 'gatsby-plugin-offline',
      options: {
        workboxConfig: {
          globPatterns: ['**/static*']
        }
      }
    },
    {
      resolve: 'gatsby-plugin-alias-imports',
      options: {
        alias: {
          '~/adaptors': 'src/adaptors',
          '~/components': 'src/components',
          '~/util': 'src/util'
        }
      }
    }
  ]
}

export default config;