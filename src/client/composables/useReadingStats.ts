import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vitepress'
import { store } from '../store'
import type { ResolvedReaderOptions } from '../types'

/**
 * Track reading statistics: total pages, reading time, and streak.
 */
export function useReadingStats(options: ResolvedReaderOptions) {
  const { route } = useRouter()
  const { storageKey } = options.readingStats

  const totalUniquePages = ref<string[]>([])
  const totalReadingTimeMs = ref(0)
  const readingDays = ref<string[]>([])

  // Timing state
  let startTime = 0
  let accumulatedMs = 0

  // ---- Load from store ----
  function loadState(): void {
    const data = store.getStats(storageKey)
    totalUniquePages.value = data.totalUniquePages
    totalReadingTimeMs.value = data.totalReadingTimeMs
    readingDays.value = data.readingDays
  }

  // ---- Save to store ----
  function saveState(): void {
    store.setStats(storageKey, {
      totalUniquePages: totalUniquePages.value,
      totalReadingTimeMs: totalReadingTimeMs.value,
      readingDays: readingDays.value,
      lastReadingDate: todayStr(),
    })
  }

  // ---- Helpers ----
  function todayStr(): string {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  function recordDay(): void {
    const today = todayStr()
    if (!readingDays.value.includes(today)) {
      readingDays.value = [...readingDays.value, today].sort()
    }
  }

  function recordPage(path: string): void {
    if (!totalUniquePages.value.includes(path)) {
      totalUniquePages.value = [...totalUniquePages.value, path]
    }
  }

  // ---- Timer: start when page is visible, pause when hidden ----
  function resetTimer(): void {
    startTime = Date.now()
    accumulatedMs = 0
  }

  function pauseTimer(): void {
    if (startTime > 0) {
      accumulatedMs += Date.now() - startTime
      startTime = 0
    }
  }

  function resumeTimer(): void {
    startTime = Date.now()
  }

  function commitTimer(): void {
    pauseTimer()
    totalReadingTimeMs.value += accumulatedMs
    accumulatedMs = 0
    saveState()
  }

  function onVisibilityChange(): void {
    if (document.hidden) {
      pauseTimer()
    } else {
      resumeTimer()
    }
  }

  // ---- Computed ----
  const totalPagesRead = computed(() => totalUniquePages.value.length)

  const currentStreak = computed(() => {
    if (readingDays.value.length === 0) return 0
    const sorted = [...readingDays.value].sort().reverse()
    const today = todayStr()
    let streak = 0

    // Check if today or yesterday is in the list
    const checkDate = new Date(today)

    for (let i = 0; i <= sorted.length; i++) {
      const dateStr =
        `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`
      if (sorted.includes(dateStr)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (i === 0) {
        // Today not yet read — check if yesterday was read
        checkDate.setDate(checkDate.getDate() - 1)
        continue
      } else {
        break
      }
    }
    return streak
  })

  function formatTime(ms: number): string {
    const totalMinutes = Math.round(ms / 60000)
    if (totalMinutes < 60) return `${totalMinutes}m`
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  // ---- Setup ----
  onMounted(() => {
    loadState()
    resetTimer()
    resumeTimer()

    // Record current page
    recordPage(route.path)
    recordDay()
    saveState()

    document.addEventListener('visibilitychange', onVisibilityChange)

    // Save on tab close
    window.addEventListener('beforeunload', () => {
      commitTimer()
    })
  })

  onUnmounted(() => {
    commitTimer()
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })

  return {
    totalPagesRead,
    totalReadingTime: computed(() => totalReadingTimeMs.value),
    readingDays: computed(() => readingDays.value.length),
    currentStreak,
    formatTime,
  }
}
