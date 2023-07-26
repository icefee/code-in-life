import type { GatsbyConfig } from 'gatsby'

const config: GatsbyConfig = {
  flags: {
    DEV_SSR: true
  },
  plugins: [
    'gatsby-plugin-netlify',
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
      resolve: 'gatsby-plugin-gatsby-cloud',
      options: {
        mergeSecurityHeaders: false
      }
    }
  ]
}

export default config;