<template>
  <div v-if="options.sidebarMarkers.enabled" class="vr-sidebar-indicators">
    <div class="vr-sidebar-indicators__header">
      <span class="vr-sidebar-indicators__label">阅读进度</span>
      <span class="vr-sidebar-indicators__count">{{ readCount }} / {{ totalCount }}</span>
    </div>
    <div class="vr-sidebar-indicators__bar">
      <div
        class="vr-sidebar-indicators__bar-fill"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, onMounted, onUnmounted, watch } from 'vue'
import type { ResolvedReaderOptions } from '../types'

const readingProgress = inject<any>('vr-reading-progress')!
const sidebarData = inject<any>('vr-sidebar-data')!
const options = inject<ResolvedReaderOptions>('vr-options')!

const readCount = computed(() =>
  readingProgress.readPages.value.filter((p: string) =>
    sidebarData.allPages.value.includes(p)
  ).length
)

const totalCount = computed(() => sidebarData.totalPages.value)

const progressPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((readCount.value / totalCount.value) * 100)
})

// Inject read/unread indicator dots into sidebar DOM links
let obs: MutationObserver | null = null

function addSidebarDots(): void {
  if (typeof document === 'undefined') return

  const sidebar = document.querySelector('.VPSidebar')
  if (!sidebar) return

  const links = sidebar.querySelectorAll<HTMLAnchorElement>(
    'a.VPLink[href]'
  )

  const readPages: string[] = readingProgress.readPages.value

  links.forEach((link) => {
    // Avoid adding duplicate dots
    if (link.querySelector('.vr-sidebar-dot')) return

    const href = link.getAttribute('href')
    if (!href) return

    const isRead = readPages.includes(href)

    const dot = document.createElement('span')
    dot.className = `vr-sidebar-dot ${isRead ? 'vr-sidebar-dot--read' : 'vr-sidebar-dot--unread'}`
    dot.setAttribute('aria-hidden', 'true')
    dot.textContent = isRead ? '✓' : '○'
    link.insertBefore(dot, link.firstChild)
  })
}

onMounted(() => {
  if (!options.sidebarMarkers.enabled) return

  // Initial run after sidebar renders
  setTimeout(addSidebarDots, 500)

  // Observe sidebar changes (e.g. collapsed sections expanding)
  const sidebar = document.querySelector('.VPSidebar')
  if (sidebar) {
    obs = new MutationObserver(() => {
      setTimeout(addSidebarDots, 200)
    })
    obs.observe(sidebar, { childList: true, subtree: true })
  }
})

// Re-run markers when readPages changes
watch(() => readingProgress.readPages.value, () => {
  setTimeout(addSidebarDots, 200)
}, { deep: true })

onUnmounted(() => {
  obs?.disconnect()
})
</script>
