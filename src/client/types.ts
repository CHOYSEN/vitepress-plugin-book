/**
 * Complete configuration options for vitepress-plugin-book.
 * All properties are optional — defaults work out of the box.
 */
export interface ReaderOptions {
  /** Reading progress tracking and auto-redirect */
  readingProgress?: {
    enabled?: boolean // default: true
    storageKey?: string // default: 'vitepress-book:progress'
  }
  /** Scroll position memory per page */
  scrollMemory?: {
    enabled?: boolean // default: true
    throttleMs?: number // default: 500
    storageKey?: string // default: 'vitepress-book:scroll'
  }
  /** Sidebar read/unread markers */
  sidebarMarkers?: {
    enabled?: boolean // default: true
  }
  /** Reading time estimation */
  readingTime?: {
    enabled?: boolean // default: true
    /** Words per minute for English text */
    wordsPerMinute?: number // default: 200
    /** Language-specific WPM overrides. key = ISO 639-1 lang code */
    languages?: Record<string, number>
  }
  /** Back-to-top floating button */
  backToTop?: {
    enabled?: boolean // default: true
    /** Pixels scrolled before showing the button */
    threshold?: number // default: 300
  }
  /** Code block copy button */
  codeCopy?: {
    enabled?: boolean // default: true
  }
  /** Reading statistics tracking */
  readingStats?: {
    enabled?: boolean // default: true
    storageKey?: string // default: 'vitepress-book:stats'
  }
  /** Auto-redirect on revisit */
  autoRedirect?: {
    enabled?: boolean // default: true
    /** Duration in ms before auto-dismissing the toast. 0 = redirect immediately, no toast */
    toastDuration?: number // default: 5000
  }
}

/**
 * Resolved options with all defaults filled in.
 */
export interface ResolvedReaderOptions {
  readingProgress: {
    enabled: boolean
    storageKey: string
  }
  scrollMemory: {
    enabled: boolean
    throttleMs: number
    storageKey: string
  }
  sidebarMarkers: {
    enabled: boolean
  }
  readingTime: {
    enabled: boolean
    wordsPerMinute: number
    languages: Record<string, number>
  }
  backToTop: {
    enabled: boolean
    threshold: number
  }
  codeCopy: {
    enabled: boolean
  }
  readingStats: {
    enabled: boolean
    storageKey: string
  }
  autoRedirect: {
    enabled: boolean
    toastDuration: number
  }
}

/** Sidebar item with a link (leaf item) */
export interface SidebarLinkItem {
  text: string
  link: string
  items?: never
}

/** Sidebar item that contains sub-items (group) */
export interface SidebarGroupItem {
  text: string
  link?: string
  items: (SidebarLinkItem | SidebarGroupItem)[]
  collapsed?: boolean
}

/** Any sidebar item */
export type SidebarItem = SidebarLinkItem | SidebarGroupItem

/** Multi-sidebar config: keyed by path prefix */
export type SidebarMulti = Record<string, SidebarItem[]>
