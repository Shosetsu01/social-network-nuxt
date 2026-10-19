<script setup lang="ts">
import type { MediaImage } from '#shared/types/post'

interface Props {
  image: MediaImage
  isEager?: boolean
}

withDefaults(defineProps<Props>(), { isEager: false })
</script>

<template>
  <!-- A fixed aspect-ratio and placeholder background keep the card intact while loading or after a failure. -->
  <img
    class="attachment-image"
    :src="image.url"
    :alt="image.alt"
    :width="image.width"
    :height="image.height"
    :style="{ aspectRatio: `${image.width} / ${image.height}` }"
    :loading="isEager ? 'eager' : 'lazy'"
    :fetchpriority="isEager ? 'high' : undefined"
    decoding="async"
  >
</template>

<style scoped>
.attachment-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: var(--radius-md);
  background: var(--color-placeholder);
}
</style>
