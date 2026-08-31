import type { App, Plugin } from 'vue';
import { h } from 'vue';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { READER_OPTIONS_KEY, DEFAULT_OPTIONS } from './constants';
import type { ReaderOptions, ResolvedReaderOptions } from './types';

// Components
import ReaderLayout from './components/ReaderLayout.vue';
import ContinueReading from './components/ContinueReading.vue';
import ReadingTime from './components/ReadingTime.vue';
import BackToTop from './components/BackToTop.vue';
import SidebarIndicators from './components/SidebarIndicators.vue';

/**
 * Resolve user-provided options with defaults.
 */
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
  };
}

/**
 * Higher-order function that wraps VitePress DefaultTheme with all reader features.
 *
 * Architecture:
 * - ReaderLayout is the orchestrator that initializes all composables (once)
 *   and provides shared state to child components
 * - UI components are injected into VitePress DefaultTheme.Layout slots
 *   for proper positioning within the document structure
 * - Self-contained components (ContinueReading, CodeCopyButton) render
 *   alongside the layout via Teleport or MutationObserver
 *
 * @example
 * ```ts
 * // .vitepress/theme/index.ts
 * import { withReader } from 'vitepress-plugin-book/client'
 * import 'vitepress-plugin-book/client/style.css'
 *
 * export default withReader({
 *   readingTime: { wordsPerMinute: 300 },
 *   autoRedirect: { toastDuration: 3000 }
 * })
 * ```
 */
export function withReader(userOptions: ReaderOptions = {}): Theme {
  const resolved = resolveOptions(userOptions);

  return {
    extends: DefaultTheme,
    Layout() {
      return h(ReaderLayout, null, {
        // ReaderLayout's default slot renders DefaultTheme.Layout with
        // all reader UI components injected into appropriate slots
        default: () =>
          h(DefaultTheme.Layout, null, {
            // Reading time badge before doc content
            'doc-before': () => h(ReadingTime),
            // Continue-reading toast above doc content
            'doc-top': () => h(ContinueReading),
            // Back-to-top button after doc content
            'doc-after': () => h(BackToTop),
            // Sidebar indicators in sidebar nav area
            'sidebar-nav-before': () => h(SidebarIndicators),
          }),
      });
    },
    enhanceApp({ app }: { app: App }): void {
      // Provide resolved options to all child components
      app.provide(READER_OPTIONS_KEY, resolved);

      // Register CodeCopyButton globally — it's self-contained
      // (MutationObserver-based, doesn't need a specific slot)
    },
  };
}

/**
 * Vue plugin for manual installation.
 * Use this if you want more control over how components are registered.
 *
 * @example
 * ```ts
 * enhanceApp({ app }) {
 *   app.use(VitepressReaderPlugin, { readingTime: { wordsPerMinute: 300 } })
 * }
 * ```
 */
export const VitepressReaderPlugin: Plugin<ReaderOptions | undefined> = {
  install(app: App, options: ReaderOptions = {}) {
    const resolved = resolveOptions(options);
    app.provide(READER_OPTIONS_KEY, resolved);

    // Register all components globally
    app.component('ReaderLayout', ReaderLayout);
    app.component('ContinueReading', ContinueReading);
    app.component('ReadingTime', ReadingTime);
    app.component('BackToTop', BackToTop);
    app.component('SidebarIndicators', SidebarIndicators);
  },
};

// Re-export components for direct use
export { ReaderLayout };
export { ContinueReading };
export { ReadingTime };
export { BackToTop };
export { SidebarIndicators };

// Re-export types
export type { ReaderOptions, ResolvedReaderOptions } from './types';

// Re-export constants
export { READER_OPTIONS_KEY, DEFAULT_OPTIONS } from './constants';
