<template>
  <div v-if="options.sidebarMarkers.enabled" class="vb-sidebar-indicators">
    <div class="vb-sidebar-indicators__header">
      <span class="vb-sidebar-indicators__label">阅读进度</span>
      <span class="vb-sidebar-indicators__count"
        >{{ readCount }} / {{ totalCount }}</span
      >
    </div>
    <div class="vb-sidebar-indicators__bar">
      <div
        class="vb-sidebar-indicators__bar-fill"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, watch } from "vue";
import { useRouter } from "vitepress";
import type { ResolvedReaderOptions } from "../types";

const readingProgress = inject<any>("vb-reading-progress")!;
const sidebarData = inject<any>("vb-sidebar-data")!;
const options = inject<ResolvedReaderOptions>("vb-options")!;
const { route } = useRouter();

const readCount = computed(() => {
  const readPages = new Set( readingProgress.readPages.value );

  return sidebarData.allPages.value.filter(
    (page: string) => readPages.has(page)
  ).length;
});

const totalCount = computed(() => sidebarData.totalPages.value);


const progressPercent = computed(() => {
  if (totalCount.value === 0) return 0;

  return Math.round(
    (readCount.value / totalCount.value) * 100
  );
});

  function normalizePath(path: string | null) {
    return path?.replace(/\/$/, "").replace(/\.html$/, "");
  }

function syncSidebarLinks() {
  const sidebar = document.querySelector(".VPSidebar");

  if (!sidebar) {
    return;
  }

  const readPages = new Set(readingProgress.readPages.value);

  const links =sidebar.querySelectorAll<HTMLAnchorElement>("a.VPLink[href]");

  links.forEach((link) => {
    const href = normalizePath(link.getAttribute("href"));
    if (!href) return;

    const isRead = readPages.has(href);

    link.classList.toggle("vb-sidebar-link--read", isRead);
  });
}


function syncDocAsideLinks() {
  const aside = document.querySelector(".VPDocAside");
  if (!aside) return;

  const outlineLinks = Array.from(
    aside.querySelectorAll<HTMLAnchorElement>(".outline-link[href]")
  );

  const activeIndex = outlineLinks.findIndex((link) =>
    link.classList.contains("active")
  );


  const readPages = new Set(readingProgress.readPages.value)

  outlineLinks.forEach((link, index) => {
    const isRead = activeIndex !== -1 ? index < activeIndex : false;

    if (readPages.has(route.path)) {
      link?.classList.add("vb-doc-aside--read")
    }

    link?.classList.toggle("vb-doc-aside--read", isRead);
  });
}


function syncSidebarMarkers() {
  if (typeof document === "undefined") {
    return;
  }

  syncSidebarLinks();
  syncDocAsideLinks();
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
  }
);


watch(
  () =>
    readingProgress.readingProgress.value[route.path ?? ""],
  () => {
    if (!options.sidebarMarkers.enabled) {
      return;
    }

    requestAnimationFrame(
      syncSidebarMarkers
    );
  }
);


watch(
  () => [...readingProgress.readPages.value,],
  () => {
    if (!options.sidebarMarkers.enabled) {
      return;
    }

    syncSidebarMarkers();
  }
);
</script>