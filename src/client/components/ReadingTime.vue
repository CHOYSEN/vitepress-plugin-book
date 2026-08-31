<template>
  <div v-if="options.readingTime.enabled" class="vb-reading-time">
    ⏱ {{ readingTime.displayText.value }}
  </div>
</template>

<script setup lang="ts">
import { inject } from "vue";
import type { ResolvedReaderOptions } from "../types";

const readingTime = inject<any>("vb-reading-time")!;
const options = inject<ResolvedReaderOptions>("vb-options")!;
</script>
