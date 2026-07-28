import { describe, it, expect } from 'vitest'

// Copy resolveOptions here to test it in isolation
import { DEFAULT_OPTIONS } from '../src/client/constants'
import type { ReaderOptions, ResolvedReaderOptions } from '../src/client/types'

function resolveOptions(userOptions: ReaderOptions = {}): ResolvedReaderOptions {
  return {
    readingProgress: {
      ...DEFAULT_OPTIONS.readingProgress,
      ...userOptions.readingProgress,
    },
    scrollMemory: {
      ...DEFAULT_OPTIONS.scrollMemory,
      ...userOptions.scrollMemory,
    },
    sidebarMarkers: {
      ...DEFAULT_OPTIONS.sidebarMarkers,
      ...userOptions.sidebarMarkers,
    },
    readingTime: {
      ...DEFAULT_OPTIONS.readingTime,
      ...userOptions.readingTime,
      languages: {
        ...DEFAULT_OPTIONS.readingTime.languages,
        ...userOptions.readingTime?.languages,
      },
    },
    backToTop: {
      ...DEFAULT_OPTIONS.backToTop,
      ...userOptions.backToTop,
    },
    codeCopy: {
      ...DEFAULT_OPTIONS.codeCopy,
      ...userOptions.codeCopy,
    },
    readingStats: {
      ...DEFAULT_OPTIONS.readingStats,
      ...userOptions.readingStats,
    },
    autoRedirect: {
      ...DEFAULT_OPTIONS.autoRedirect,
      ...userOptions.autoRedirect,
    },
  }
}

describe('resolveOptions', () => {
  it('returns defaults when called with no arguments', () => {
    const opts = resolveOptions()
    expect(opts.readingProgress.enabled).toBe(true)
    expect(opts.readingTime.wordsPerMinute).toBe(200)
    expect(opts.backToTop.threshold).toBe(300)
    expect(opts.autoRedirect.toastDuration).toBe(5000)
    expect(opts.autoRedirect.enabled).toBe(true)
  })

  it('deep-merges partial options', () => {
    const opts = resolveOptions({
      readingTime: { wordsPerMinute: 350 },
      autoRedirect: { toastDuration: 2000 },
    })
    // overridden
    expect(opts.readingTime.wordsPerMinute).toBe(350)
    expect(opts.autoRedirect.toastDuration).toBe(2000)
    // preserved defaults
    expect(opts.readingTime.enabled).toBe(true)
    expect(opts.autoRedirect.enabled).toBe(true)
    expect(opts.backToTop.enabled).toBe(true)
  })

  it('disables individual features', () => {
    const opts = resolveOptions({
      codeCopy: { enabled: false },
      sidebarMarkers: { enabled: false },
    })
    expect(opts.codeCopy.enabled).toBe(false)
    expect(opts.sidebarMarkers.enabled).toBe(false)
    // others still on
    expect(opts.readingProgress.enabled).toBe(true)
    expect(opts.readingTime.enabled).toBe(true)
  })

  it('customizes storage keys', () => {
    const opts = resolveOptions({
      readingProgress: { storageKey: 'my-app:prog' },
      scrollMemory: { storageKey: 'my-app:scroll' },
      readingStats: { storageKey: 'my-app:stats' },
    })
    expect(opts.readingProgress.storageKey).toBe('my-app:prog')
    expect(opts.scrollMemory.storageKey).toBe('my-app:scroll')
    expect(opts.readingStats.storageKey).toBe('my-app:stats')
  })

  it('sets autoRedirect toastDuration to 0 for immediate redirect', () => {
    const opts = resolveOptions({ autoRedirect: { toastDuration: 0 } })
    expect(opts.autoRedirect.toastDuration).toBe(0)
    expect(opts.autoRedirect.enabled).toBe(true)
  })

  it('adds language-specific WPM overrides', () => {
    const opts = resolveOptions({
      readingTime: {
        languages: { zh: 400, es: 250 },
      },
    })
    expect(opts.readingTime.languages.zh).toBe(400)
    expect(opts.readingTime.languages.es).toBe(250)
    // original defaults preserved
    expect(opts.readingTime.languages.ja).toBe(300)
    expect(opts.readingTime.languages.ko).toBe(300)
  })

  it('changes backToTop threshold', () => {
    const opts = resolveOptions({ backToTop: { threshold: 600 } })
    expect(opts.backToTop.threshold).toBe(600)
  })

  it('changes scrollMemory throttle', () => {
    const opts = resolveOptions({ scrollMemory: { throttleMs: 1000 } })
    expect(opts.scrollMemory.throttleMs).toBe(1000)
  })
})
