import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useData } from 'vitepress'
import type { ResolvedReaderOptions } from '../types'

/**
 * Estimate reading time for the current page based on word count.
 */
export function useReadingTime(options: ResolvedReaderOptions) {
  const { page } = useData()
  const wordCount = ref(0)
  const readingTimeMinutes = ref(1)

  const { wordsPerMinute, languages } = options.readingTime

  /** Detect if text is primarily CJK */
  function isCJK(text: string): boolean {
    const cjkRegex =
      /[一-鿿㐀-䶿豈-﫿＀-￯　-〿぀-ゟ゠-ヿ가-힯]/
    const cjkChars = text.match(cjkRegex)
    return cjkChars ? cjkChars.length > text.length * 0.3 : false
  }

  /** Count words: whitespace-split for English, char-based for CJK */
  function countWords(text: string, cjk: boolean): number {
    if (cjk) {
      // CJK: count ~2 chars as one "word" since CJK chars carry more info
      return Math.ceil(text.length / 2)
    }
    return text.split(/\s+/).filter((w) => w.length > 0).length
  }

  /** Get effective WPM for the current language */
  function getWPM(cjk: boolean): number {
    if (cjk && languages) {
      return languages.zh ?? wordsPerMinute * 1.5
    }
    return wordsPerMinute
  }

  /** Calculate reading time from page content */
  function calculateTime(): void {
    if (typeof document === 'undefined') return

    const contentEl = document.querySelector('.vp-doc') ?? document.querySelector('article')
    if (!contentEl) return

    const text = contentEl.textContent ?? ''
    const cjk = isCJK(text)
    const words = countWords(text, cjk)
    wordCount.value = words

    const wpm = getWPM(cjk)
    readingTimeMinutes.value = Math.max(1, Math.ceil(words / wpm))
  }

  const displayText = computed(() => {
    return `约 ${readingTimeMinutes.value} 分钟`
  })

  let observer: MutationObserver | null = null

  onMounted(() => {
    // Wait for DOM to be ready, then calculate
    setTimeout(calculateTime, 100)

    // Also observe content changes (e.g., dynamic content loading)
    const contentEl = document.querySelector('.vp-doc') ?? document.querySelector('article')
    if (contentEl) {
      observer = new MutationObserver(() => calculateTime())
      observer.observe(contentEl, { childList: true, subtree: true, characterData: true })
    }
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return {
    wordCount,
    readingTimeMinutes,
    displayText,
  }
}
