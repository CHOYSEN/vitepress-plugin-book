import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'VitePress Plugin Reader Demo',
  description: 'Demo site for vitepress-plugin-reader',
  lang: 'zh-CN',
  themeConfig: {
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/guide/intro' },
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Configuration', link: '/guide/configuration' },
        ],
      },
      {
        text: 'Examples',
        items: [
          { text: 'Basic Usage', link: '/examples/basic' },
          { text: 'Advanced Usage', link: '/examples/advanced' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com' },
    ],
  },
})
