import { computed, type Ref } from 'vue';
import { useData } from 'vitepress';
import type { SidebarItem, SidebarMarkerItem } from '../types';

function normalizePath(path: string): string {
  return path.replace(/\/$/, '').replace(/\.html$/, '');
}

/**
 * Extract all page paths from VitePress sidebar configuration.
 * Handles both array and multi-sidebar formats.
 */
function extractPages(sidebar: unknown): string[] {
  if (!sidebar) return [];

  const pages = new Set<string>();

  const walkItems = (items: SidebarItem[]): void => {
    for (const item of items) {
      if (item.link) {
        pages.add(item.link);
      }
      if (item.items && Array.isArray(item.items)) {
        walkItems(item.items as SidebarItem[]);
      }
    }
  };

  if (Array.isArray(sidebar)) {
    walkItems(sidebar as SidebarItem[]);
  } else if (typeof sidebar === 'object') {
    for (const key of Object.keys(sidebar as Record<string, unknown>)) {
      const items = (sidebar as Record<string, SidebarItem[]>)[key];
      if (Array.isArray(items)) {
        walkItems(items);
      }
    }
  }

  return Array.from(pages);
}

/**
 * Composable to extract all page info from the VitePress sidebar config.
 */
export function useSidebarData(readPages?: Ref<string[]>) {
  const { theme } = useData();

  const allPages = computed<string[]>(() => {
    const sidebar = theme.value.sidebar;
    return extractPages(sidebar);
  });

  const totalPages = computed(() => allPages.value.length);

  const allPagesSet = computed(() => new Set(allPages.value));

  const sidebarItems = computed<SidebarMarkerItem[]>(() => {
    const sidebar = theme.value.sidebar;
    const readPagesSet = new Set((readPages?.value ?? []).map(normalizePath));
    const items: SidebarMarkerItem[] = [];

    const walkItems = (currentItems: SidebarItem[]): void => {
      for (const item of currentItems) {
        if (item.link) {
          items.push({
            text: item.text,
            link: item.link,
            isRead: readPagesSet.has(normalizePath(item.link)),
          });
        }
        if (item.items && Array.isArray(item.items)) {
          walkItems(item.items as SidebarItem[]);
        }
      }
    };

    if (Array.isArray(sidebar)) {
      walkItems(sidebar as SidebarItem[]);
    } else if (typeof sidebar === 'object') {
      for (const key of Object.keys(sidebar as Record<string, unknown>)) {
        const currentItems = (sidebar as Record<string, SidebarItem[]>)[key];
        if (Array.isArray(currentItems)) {
          walkItems(currentItems);
        }
      }
    }

    return items;
  });

  return {
    allPages,
    totalPages,
    allPagesSet,
    sidebarItems,
  };
}
