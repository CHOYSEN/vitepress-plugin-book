/**
 * vitepress-plugin-reader — main entry point.
 *
 * Currently, all functionality is client-side. No separate Vite plugin is needed.
 * This file provides a placeholder for future server/build-side features
 * (e.g., build-time word count, sitemap integration, etc.).
 *
 * @packageDocumentation
 */

export type { ReaderOptions, ResolvedReaderOptions } from './client/types'

/**
 * Placeholder for future build-time plugin functionality.
 */
export function readerBuildPlugin() {
  return {
    name: 'vitepress-plugin-reader',
    // Future build hooks here
  }
}
