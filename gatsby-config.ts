import type { GatsbyConfig } from 'gatsby'

const config: GatsbyConfig = {
  flags: {
    DEV_SSR: true
  },
  plugins: [
    'gatsby-plugin-netlify'
  ]
}

export default config;
