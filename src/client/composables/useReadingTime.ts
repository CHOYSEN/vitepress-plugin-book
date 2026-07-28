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

  /** Detect if text is primarily CJK using code-point ranges */
  function isCJK(text: string): boolean {
    const ranges: [number, number][] = [
      [0x4e00, 0x9fff], // CJK Unified Ideographs
      [0x3400, 0x4dbf], // CJK Extension A
      [0x3040, 0x309f], // Hiragana
      [0x30a0, 0x30ff], // Katakana
      [0xac00, 0xd7af], // Hangul
    ]
    let cjkCount = 0
    for (const ch of text) {
      const cp = ch.codePointAt(0)!
      if (ranges.some(([lo, hi]) => cp >= lo && cp <= hi)) {
        cjkCount++
      }
    }
    return cjkCount > text.length * 0.3
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
