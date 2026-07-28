import { ref } from 'vue'

/** Mock vitepress `useData` — configurable per test */
export const mockData = {
  site: ref({}),
  theme: ref({
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Intro', link: '/guide/intro' },
          { text: 'Install', link: '/guide/install' },
          {
            text: 'Advanced',
            items: [
              { text: 'Config', link: '/guide/config' },
            ],
          },
        ],
      },
      {
        text: 'API',
        items: [
          { text: 'Overview', link: '/api/overview' },
        ],
      },
    ],
  }),
  page: ref({
    title: 'Test Page',
    relativePath: 'guide/intro.md',
    filePath: 'guide/intro.md',
    headers: [],
    frontmatter: {},
  }),
  frontmatter: ref({}),
  params: ref({}),
  title: ref('Test Page'),
  description: ref('A test page'),
  lang: ref('en'),
  isDark: ref(false),
  dir: ref('ltr'),
  localeIndex: ref('root'),
  hash: ref(''),
}

/** Mock vitepress `useRouter` */
export const mockRouter = {
  route: { path: '/guide/intro', data: {}, component: null },
  go: async (_to?: string) => {},
  onBeforeRouteChange: undefined as ((to: string) => void | boolean | Promise<void | boolean>) | undefined,
  onBeforePageLoad: undefined as ((to: string) => void | boolean | Promise<void | boolean>) | undefined,
  onAfterPageLoad: undefined as ((to: string) => void | Promise<void>) | undefined,
  onAfterRouteChange: undefined as ((to: string) => void | Promise<void>) | undefined,
}

export function useData() { return mockData }
export function useRouter() { return mockRouter }
export function useRoute() { return { path: '/guide/intro', data: {}, component: null } }
export function withBase(path: string) { return path }
