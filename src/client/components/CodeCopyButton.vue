<template>
  <div v-if="enabled" ref="containerRef" style="display: none" />
</template>

<script setup lang="ts">
import { inject, computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vitepress'
import { READER_OPTIONS_KEY } from '../constants'
import type { ResolvedReaderOptions } from '../types'

const options = inject<ResolvedReaderOptions>(READER_OPTIONS_KEY)!
const { route } = useRouter()
const enabled = computed(() => options.codeCopy.enabled)

let observer: MutationObserver | null = null
const processedPreBlocks = new WeakSet<HTMLElement>()

/**
 * Add copy button to a single code block.
 */
function addCopyButton(pre: HTMLElement): void {
  if (processedPreBlocks.has(pre)) return
  processedPreBlocks.add(pre)

  // Create wrapper for relative positioning
  pre.style.position = 'relative'

  const button = document.createElement('button')
  button.className = 'vb-code-copy-btn'
  button.setAttribute('aria-label', '复制代码')
  button.title = '复制代码'
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
    <span class="vb-code-copy-btn__text">复制</span>
  `

  button.addEventListener('click', async () => {
    const code = pre.querySelector('code')
    const text = code?.textContent ?? ''
    try {
      await navigator.clipboard.writeText(text)
      button.classList.add('vb-code-copy-btn--copied')
      button.querySelector('.vb-code-copy-btn__text')!.textContent = '已复制!'
      setTimeout(() => {
        button.classList.remove('vb-code-copy-btn--copied')
        button.querySelector('.vb-code-copy-btn__text')!.textContent = '复制'
      }, 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      button.classList.add('vb-code-copy-btn--copied')
      button.querySelector('.vb-code-copy-btn__text')!.textContent = '已复制!'
      setTimeout(() => {
        button.classList.remove('vb-code-copy-btn--copied')
        button.querySelector('.vb-code-copy-btn__text')!.textContent = '复制'
      }, 2000)
    }
  })

  pre.appendChild(button)
}

/**
 * Find and process all code blocks within a container.
 */
function processCodeBlocks(container: HTMLElement | Document): void {
  const pres = container.querySelectorAll<HTMLElement>(
    '.vp-doc div[class*="language-"] pre, .vp-doc pre:has(code)'
  )
  pres.forEach(addCopyButton)

  // Also handle raw pre > code in vp-doc
  const rawPres = container.querySelectorAll<HTMLElement>(
    '.vp-doc pre'
  )
  rawPres.forEach(pre => {
    if (pre.querySelector('code')) {
      addCopyButton(pre)
    }
  })
}

/**
 * Remove all copy buttons from the DOM.
 */
function removeAllButtons(): void {
  document.querySelectorAll('.vb-code-copy-btn').forEach(btn => btn.remove())
}

// On mount, observe the document for code blocks
onMounted(() => {
  if (typeof document === 'undefined') return

  // Process existing blocks
  processCodeBlocks(document)

  // Observe for new blocks (e.g., during route change / dynamic content)
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          processCodeBlocks(node)
        }
      }
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })

  // Clean up and re-process when route changes
  const unwatch = () => {
    // Route changed — reset processed set and re-process
    // (WeakSet entries can't be cleared, so we create a new one)
    setTimeout(() => {
      processCodeBlocks(document)
    }, 300)
  }

  // Use a simple approach: watch the route
})

onUnmounted(() => {
  observer?.disconnect()
  removeAllButtons()
})
</script>
