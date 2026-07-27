import type { InjectionKey } from 'vue'
import type { ResolvedReaderOptions } from './types'

/** Injection key for providing resolved options to child components */
export const READER_OPTIONS_KEY: InjectionKey<ResolvedReaderOptions> =
  Symbol('vitepress-reader:options')

/** Default localStorage prefix for all keys */
export const STORAGE_PREFIX = 'vitepress-reader:'

/** Default options */
export const DEFAULT_OPTIONS: ResolvedReaderOptions = {
  readingProgress: {
    enabled: true,
    storageKey: 'vitepress-reader:progress',
  },
  scrollMemory: {
    enabled: true,
    throttleMs: 500,
    storageKey: 'vitepress-reader:scroll',
  },
  sidebarMarkers: {
    enabled: true,
  },
  readingTime: {
    enabled: true,
    wordsPerMinute: 200,
    languages: {
      zh: 300, // Chinese: ~300 chars/min
      ja: 300, // Japanese: ~300 chars/min
      ko: 300, // Korean: ~300 chars/min
      // Default for en/other: ~200 wpm
    },
  },
  backToTop: {
    enabled: true,
    threshold: 300,
  },
  codeCopy: {
    enabled: true,
  },
  readingStats: {
    enabled: true,
    storageKey: 'vitepress-reader:stats',
  },
  autoRedirect: {
    enabled: true,
    toastDuration: 5000,
  },
}

/** Data models */

export interface ReadingProgressData {
  /** Set of page paths that have been visited */
  readPages: string[]
  /** Last visited page path */
  lastVisitedPage: string
  /** Timestamp of last visit */
  lastVisitedAt: number
}

export interface ScrollPositionsData {
  /** Map of page path -> scroll Y offset */
  [pagePath: string]: number
}

export interface ReadingStatsData {
  /** Set of unique page paths read */
  totalUniquePages: string[]
  /** Cumulative reading time in milliseconds */
  totalReadingTimeMs: number
  /** Sorted array of ISO date strings (YYYY-MM-DD) when reading occurred */
  readingDays: string[]
  /** Last reading date (YYYY-MM-DD) */
  lastReadingDate: string
}
