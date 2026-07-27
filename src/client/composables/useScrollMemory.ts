import { onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vitepress'
import { store } from '../store'
import type { ResolvedReaderOptions } from '../types'

/**
 * Save and restore scroll position for each page.
 */
export function useScrollMemory(options: ResolvedReaderOptions) {
  const { route } = useRouter()
  const { storageKey, throttleMs } = options.scrollMemory

  let throttleTimer: ReturnType<typeof setTimeout> | null = null

  // ---- Save current scroll position ----
  function saveCurrentPosition(path?: string): void {
    const p = path ?? route.path
    if (typeof window !== 'undefined' && p) {
      store.setScroll(storageKey, p, window.scrollY)
    }
  }

  // ---- Restore scroll position ----
  function restorePosition(path: string): void {
    const savedY = store.getScroll(storageKey, path)
    if (savedY !== null && savedY > 0) {
      nextTick(() => {
        // Small delay to let the DOM settle after page render
        requestAnimationFrame(() => {
          setTimeout(() => {
            window.scrollTo({ top: savedY, behavior: 'auto' })
          }, 150)
        })
      })
    }
  }

  // ---- Clear scroll position for a page ----
  function clearPosition(path: string): void {
    store.setScroll(storageKey, path, 0)
  }

  // ---- Throttled scroll handler ----
  function onScroll(): void {
    if (throttleTimer) return
    throttleTimer = setTimeout(() => {
      throttleTimer = null
      saveCurrentPosition()
    }, throttleMs)
  }

  // ---- Setup ----
  onMounted(() => {
    if (typeof window === 'undefined') return

    // Only restore if no hash in URL (user clicked a heading link)
    const currentPath = route.path
    if (currentPath && !window.location.hash) {
      restorePosition(currentPath)
    }

    // Listen for scroll events
    window.addEventListener('scroll', onScroll, { passive: true })

    // Also save on beforeunload
    window.addEventListener('beforeunload', () => saveCurrentPosition())
  })

  onUnmounted(() => {
    if (typeof window === 'undefined') return
    window.removeEventListener('scroll', onScroll)
  })

  return {
    saveCurrentPosition,
    restorePosition,
    clearPosition,
  }
}
