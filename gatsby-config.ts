import type { GatsbyConfig } from 'gatsby'
import adapter from 'gatsby-adapter-netlify'

const config: GatsbyConfig = {
  adapter: adapter(),
  plugins: [
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: '音乐搜索',
        short_name: '音乐搜索',
        icon: 'static/icon.png',
        start_url: '/?mode=pwa',
        background_color: '#03a9f4',
        theme_color: '#3f51b5',
        display: 'standalone'
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