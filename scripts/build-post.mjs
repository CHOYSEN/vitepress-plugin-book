// Post-build: copy CSS + generate DTS type declarations.
import { writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');
const distClient = join(dist, 'client');

mkdirSync(distClient, { recursive: true });

// ---- Copy standalone CSS ----
copyFileSync(join(root, 'src/client/styles/index.css'), join(distClient, 'style.css'));
console.log('✓ dist/client/style.css');

// ---- dist/index.d.ts (server entry) ----
writeFileSync(
  join(dist, 'index.d.ts'),
  `\
export type { ReaderOptions, ResolvedReaderOptions } from './client/index.js'

export declare function readerBuildPlugin(): {
  name: string
}
`,
);

// ---- dist/client/index.d.ts ----
writeFileSync(
  join(dist, 'client', 'index.d.ts'),
  `\
import type { App, Plugin, DefineComponent } from 'vue'
import type { Theme } from 'vitepress'

// --------------------- Types ---------------------

export interface ReaderOptions {
  readingProgress?: {
    enabled?: boolean
    storageKey?: string
  }
  scrollMemory?: {
    enabled?: boolean
    throttleMs?: number
    storageKey?: string
  }
  sidebarMarkers?: {
    enabled?: boolean
  }
  readingTime?: {
    enabled?: boolean
    wordsPerMinute?: number
    languages?: Record<string, number>
  }
  backToTop?: {
    enabled?: boolean
    threshold?: number
  }
  codeCopy?: {
    enabled?: boolean
  }
  readingStats?: {
    enabled?: boolean
    storageKey?: string
  }
  autoRedirect?: {
    enabled?: boolean
    toastDuration?: number
  }
}

export interface ResolvedReaderOptions {
  readingProgress: { enabled: boolean; storageKey: string }
  scrollMemory: { enabled: boolean; throttleMs: number; storageKey: string }
  sidebarMarkers: { enabled: boolean }
  readingTime: { enabled: boolean; wordsPerMinute: number; languages: Record<string, number> }
  backToTop: { enabled: boolean; threshold: number }
  codeCopy: { enabled: boolean }
  readingStats: { enabled: boolean; storageKey: string }
  autoRedirect: { enabled: boolean; toastDuration: number }
}

// --------------------- Constants ---------------------

export const READER_OPTIONS_KEY: unique symbol
export const DEFAULT_OPTIONS: ResolvedReaderOptions

// --------------------- Theme extension ---------------------

export declare function withReader(userOptions?: ReaderOptions): Theme

// --------------------- Vue Plugin ---------------------

export declare const VitepressReaderPlugin: Plugin<ReaderOptions | undefined>

// --------------------- Components ---------------------

export declare const ReaderLayout: DefineComponent<{}, {}, any>
export declare const ProgressBar: DefineComponent<{}, {}, any>
export declare const ContinueReading: DefineComponent<{}, {}, any>
export declare const ReadingTime: DefineComponent<{}, {}, any>
export declare const BackToTop: DefineComponent<{}, {}, any>
export declare const CodeCopyButton: DefineComponent<{}, {}, any>
export declare const SidebarIndicators: DefineComponent<{}, {}, any>
`,
);

console.log('✓ dist/client/index.d.ts');
console.log('✓ dist/index.d.ts');
