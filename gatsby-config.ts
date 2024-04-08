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
        background_color: '#d9b8ff',
        theme_color: '#d9b8ff',
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
      resolve: 'gatsby-plugin-no-sourcemaps'
    }
  ]
}

export default config;