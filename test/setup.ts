import { beforeEach } from 'vitest'

// Provide a clean localStorage mock for every test
beforeEach(() => {
  const storage = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value) },
    removeItem: (key: string) => { storage.delete(key) },
    clear: () => { storage.clear() },
    get length() { return storage.size },
    key: (index: number) => Array.from(storage.keys())[index] ?? null,
  } as Storage
})

// Reset vitepress mocks to default state before each test
beforeEach(async () => {
  const { mockData, mockRouter } = await import('./__mocks__/vitepress')
  mockData.theme.value = {
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
  } as any
  mockData.page.value = {
    title: 'Test Page',
    relativePath: 'guide/intro.md',
    filePath: 'guide/intro.md',
    headers: [],
    frontmatter: {},
  } as any
  mockRouter.route = { path: '/guide/intro', data: {}, component: null }
  mockRouter.onAfterRouteChange = undefined
  mockRouter.onBeforeRouteChange = undefined
})
