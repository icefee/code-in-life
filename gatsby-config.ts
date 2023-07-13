import type { GatsbyConfig } from 'gatsby'

const config: GatsbyConfig = {
  plugins: [
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: '音乐搜索',
        short_name: '音乐搜索',
        icon: 'static/icon.png',
        start_url: '/',
        background_color: '#03a9f4',
        theme_color: '#3f51b5',
        display: 'standalone'
      }
    }
  ]
}

export default config;