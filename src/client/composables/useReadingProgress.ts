import { ref, computed, onMounted, watch } from 'vue'
import { useData, useRouter } from 'vitepress'
import { store } from '../store'
import type { ResolvedReaderOptions } from '../types'
import { useSidebarData } from './useSidebarData'

/**
 * Track which pages have been read and provide progress percentage.
 * Also handles the "continue where you left off" experience.
 */
export function useReadingProgress(options: ResolvedReaderOptions) {
  const { route } = useRouter()
  const { page } = useData()
  const { allPagesSet } = useSidebarData()

  const {
    storageKey,
  } = options.readingProgress

  // ---- Reactive state ----
  const readPages = ref<string[]>([])
  const lastVisitedPage = ref<string>('')
  const lastVisitedAt = ref<number>(0)
  const showContinuePrompt = ref(false)

  // ---- Load initial state ----
  function loadState(): void {
    const data = store.getProgress(storageKey)
    readPages.value = data.readPages
    lastVisitedPage.value = data.lastVisitedPage
    lastVisitedAt.value = data.lastVisitedAt
  }

  // ---- Save state ----
  function saveState(): void {
    store.setProgress(storageKey, {
      readPages: readPages.value,
      lastVisitedPage: lastVisitedPage.value,
      lastVisitedAt: lastVisitedAt.value,
    })
  }

  // ---- Mark current page as read ----
  function markAsRead(path: string): void {
    if (!readPages.value.includes(path)) {
      readPages.value = [...readPages.value, path]
    }
    lastVisitedPage.value = path
    lastVisitedAt.value = Date.now()
    saveState()
  }

  // ---- Check if a specific page has been read ----
  function isPageRead(path: string): boolean {
    return readPages.value.includes(path)
  }

  // ---- Progress percentage ----
  const progress = computed(() => {
    if (allPagesSet.value.size === 0) return 0
    const readCount = readPages.value.filter((p) => allPagesSet.value.has(p)).length
    return Math.round((readCount / allPagesSet.value.size) * 100)
  })

  // ---- Dismiss continue prompt ----
  function dismissContinuePrompt(): void {
    showContinuePrompt.value = false
  }

  // ---- Navigate to last visited page ----
  function goToLastVisited(): void {
    const target = lastVisitedPage.value
    dismissContinuePrompt()
    if (target && target !== route.path) {
      // Use location.href for a full navigation to the target
      window.location.href = target
    }
  }

  // ---- Init on mount (SSR-safe) ----
  onMounted(() => {
    loadState()

    // Check if we should show the "continue reading" prompt
    const currentPath = route.path
    if (
      options.autoRedirect.enabled &&
      lastVisitedPage.value &&
      lastVisitedPage.value !== currentPath
    ) {
      if (options.autoRedirect.toastDuration === 0) {
        // Redirect immediately
        window.location.href = lastVisitedPage.value
        return
      }
      showContinuePrompt.value = true
    }
  })

  // Watch for page changes during SPA navigation
  watch(
    () => route.path,
    (newPath, oldPath) => {
      if (oldPath && newPath !== oldPath) {
        markAsRead(newPath)
      }
    },
  )

  return {
    readPages,
    progress,
    isPageRead,
    markAsRead,
    lastVisitedPage,
    lastVisitedAt,
    showContinuePrompt,
    dismissContinuePrompt,
    goToLastVisited,
  }
}
