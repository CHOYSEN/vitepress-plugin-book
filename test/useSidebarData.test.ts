import { describe, it, expect, beforeEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { useSidebarData } from '../src/client/composables/useSidebarData';
import { mockData } from './__mocks__/vitepress';

describe('useSidebarData', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ---- extractPages internals via the composable ----
  it('extracts all page links from array-format sidebar', () => {
    mockData.theme.value = {
      sidebar: [
        {
          text: 'Guide',
          items: [
            { text: 'Intro', link: '/guide/intro' },
            { text: 'Install', link: '/guide/install' },
          ],
        },
        { text: 'External', link: 'https://example.com' },
      ],
    } as any;

    const { allPages } = useSidebarData();
    expect(allPages.value).toContain('/guide/intro');
    expect(allPages.value).toContain('/guide/install');
    expect(allPages.value).toContain('https://example.com');
    expect(allPages.value.length).toBe(3);
  });

  it('handles nested sidebar items', () => {
    mockData.theme.value = {
      sidebar: [
        {
          text: 'Guide',
          items: [
            { text: 'Intro', link: '/guide/intro' },
            {
              text: 'Advanced',
              items: [
                { text: 'Config', link: '/guide/config' },
                { text: 'Troubleshooting', link: '/guide/trouble' },
              ],
            },
          ],
        },
      ],
    } as any;

    const { allPages } = useSidebarData();
    expect(allPages.value).toContain('/guide/intro');
    expect(allPages.value).toContain('/guide/config');
    expect(allPages.value).toContain('/guide/trouble');
    expect(allPages.value.length).toBe(3);
  });

  it('handles multi-sidebar (object) format', () => {
    mockData.theme.value = {
      sidebar: {
        '/guide/': [
          {
            text: 'Guide',
            items: [
              { text: 'Intro', link: '/guide/intro' },
              { text: 'Install', link: '/guide/install' },
            ],
          },
        ],
        '/api/': [
          {
            text: 'API',
            items: [{ text: 'Overview', link: '/api/overview' }],
          },
        ],
      },
    } as any;

    const { allPages } = useSidebarData();
    expect(allPages.value).toContain('/guide/intro');
    expect(allPages.value).toContain('/guide/install');
    expect(allPages.value).toContain('/api/overview');
    expect(allPages.value.length).toBe(3);
  });

  it('handles empty sidebar', () => {
    mockData.theme.value = { sidebar: undefined } as any;
    const { allPages, totalPages } = useSidebarData();
    expect(allPages.value).toEqual([]);
    expect(totalPages.value).toBe(0);
  });

  it('returns correct totalPages count', () => {
    mockData.theme.value = {
      sidebar: [
        {
          text: 'Guide',
          items: [
            { text: 'A', link: '/a' },
            { text: 'B', link: '/b' },
            { text: 'C', link: '/c' },
          ],
        },
      ],
    } as any;

    const { totalPages } = useSidebarData();
    expect(totalPages.value).toBe(3);
  });

  it('skips group items without links', () => {
    mockData.theme.value = {
      sidebar: [
        {
          text: 'Guide',
          collapsed: true,
          items: [
            { text: 'Page 1', link: '/p1' },
            { text: 'Page 2', link: '/p2' },
          ],
        },
      ],
    } as any;

    const { allPages, totalPages } = useSidebarData();
    // The group itself has no link, only leaf items
    expect(allPages.value).toEqual(['/p1', '/p2']);
    expect(totalPages.value).toBe(2);
  });

  it('deduplicates identical links', () => {
    mockData.theme.value = {
      sidebar: [
        { text: 'A', link: '/dup' },
        { text: 'B', link: '/dup' },
      ],
    } as any;

    const { allPages } = useSidebarData();
    expect(allPages.value.length).toBe(1);
    expect(allPages.value).toEqual(['/dup']);
  });

  it('returns annotated sidebar items with read state', () => {
    mockData.theme.value = {
      sidebar: [
        {
          text: 'Guide',
          items: [
            { text: 'Intro', link: '/guide/intro' },
            { text: 'Install', link: '/guide/install' },
          ],
        },
      ],
    } as any;

    const { sidebarItems } = useSidebarData();
    expect(sidebarItems.value).toEqual([
      expect.objectContaining({
        text: 'Intro',
        link: '/guide/intro',
        isRead: false,
      }),
      expect.objectContaining({
        text: 'Install',
        link: '/guide/install',
        isRead: false,
      }),
    ]);
  });
});
