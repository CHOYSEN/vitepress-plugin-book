<template>
  <div v-if="options.sidebarMarkers.enabled" class="vb-sidebar-indicators">
    <div class="vb-sidebar-indicators__header">
      <span class="vb-sidebar-indicators__label">阅读进度</span>
      <span class="vb-sidebar-indicators__count">{{ readCount }} / {{ totalCount }}</span>
    </div>
    <div class="vb-sidebar-indicators__bar">
      <div class="vb-sidebar-indicators__bar-fill" :style="{ width: `${progressPercent}%` }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, watch } from 'vue';
import { useRouter } from 'vitepress';
import type { ResolvedReaderOptions } from '../types';

const readingProgress = inject<any>('vb-reading-progress')!;
const sidebarData = inject<any>('vb-sidebar-data')!;
const options = inject<ResolvedReaderOptions>('vb-options')!;
const { route } = useRouter();

function normalizePath(path: string) {
  return path.replace(/\/$/, '').replace(/\.html$/, '');
}

const readCount = computed(() => {
  const readPages = new Set(readingProgress.readPages.value.map(normalizePath));

  return sidebarData.allPages.value.filter((page: string) => readPages.has(normalizePath(page)))
    .length;
});

const totalCount = computed(() => sidebarData.totalPages.value);

const progressPercent = computed(() => {
  if (totalCount.value === 0) {
    return 0;
  }

  return Math.round((readCount.value / totalCount.value) * 100);
});

function syncSidebarMarkers() {
  if (typeof document === 'undefined') {
    return;
  }

  const sidebar = document.querySelector('.VPSidebar');
  if (!sidebar) {
    return;
  }

  const links = sidebar.querySelectorAll<HTMLAnchorElement>('a.VPLink[href]');
  const readPages = new Set(readingProgress.readPages.value.map(normalizePath));

  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) {
      return;
    }

    const isRead = readPages.has(normalizePath(href));
    let marker = link.querySelector<HTMLElement>('.vb-sidebar-dot');

    if (!marker) {
      marker = document.createElement('span');
      marker.className = 'vb-sidebar-dot';
      marker.setAttribute('aria-hidden', 'true');
      link.insertBefore(marker, link.firstChild);
    }

    marker.className = `vb-sidebar-dot ${
      isRead ? 'vb-sidebar-dot--read' : 'vb-sidebar-dot--unread'
    }`;
    marker.textContent = isRead ? '✓' : '○';
  });
}

onMounted(() => {
  if (!options.sidebarMarkers.enabled) {
    return;
  }

  requestAnimationFrame(syncSidebarMarkers);
});

watch(
  () => route.path,
  () => {
    if (!options.sidebarMarkers.enabled) {
      return;
    }

    requestAnimationFrame(syncSidebarMarkers);
  },
);

watch(
  () => [...readingProgress.readPages.value],
  () => {
    if (!options.sidebarMarkers.enabled) {
      return;
    }

    syncSidebarMarkers();
  },
);
</script>
