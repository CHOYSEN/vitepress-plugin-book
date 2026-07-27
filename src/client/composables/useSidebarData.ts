import { computed } from 'vue'
import { useData } from 'vitepress'
import type { SidebarItem } from '../types'

/**
 * Extract all page paths from VitePress sidebar configuration.
 * Handles both array and multi-sidebar formats.
 */
function extractPages(sidebar: unknown): string[] {
  if (!sidebar) return []

  const pages = new Set<string>()

  const walkItems = (items: SidebarItem[]): void => {
    for (const item of items) {
      if (item.link) {
        pages.add(item.link)
      }
      if (item.items && Array.isArray(item.items)) {
        walkItems(item.items as SidebarItem[])
      }
    }
  }

  // Array format: SidebarItem[]
  if (Array.isArray(sidebar)) {
    walkItems(sidebar as SidebarItem[])
  }
  // Object format (multi-sidebar): Record<string, SidebarItem[]>
  else if (typeof sidebar === 'object') {
    for (const key of Object.keys(sidebar as Record<string, unknown>)) {
      const items = (sidebar as Record<string, SidebarItem[]>)[key]
      if (Array.isArray(items)) {
        walkItems(items)
      }
    }
  }

  return Array.from(pages)
}

/**
 * Composable to extract all page info from the VitePress sidebar config.
 */
export function useSidebarData() {
  const { theme } = useData()

  const allPages = computed<string[]>(() => {
    const sidebar = theme.value.sidebar
    return extractPages(sidebar)
  })

  const totalPages = computed(() => allPages.value.length)

  const allPagesSet = computed(() => new Set(allPages.value))

  return {
    allPages,
    totalPages,
    allPagesSet,
  }
}
