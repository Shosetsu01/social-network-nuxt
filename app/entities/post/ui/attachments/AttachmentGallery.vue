<script setup lang="ts">
import type { MediaImage } from '#shared/types/post'

interface Props {
  images: MediaImage[]
  isEager?: boolean
}

const props = withDefaults(defineProps<Props>(), { isEager: false })

// ponytail: the collage fits up to three photos (as in the original); add a "+N" tile if larger galleries appear.
const visibleImages = computed(() => props.images.slice(0, 3))
</script>

<template>
  <div class="attachment-gallery">
    <img
      v-for="image in visibleImages"
      :key="image.url"
      class="attachment-gallery__image"
      :src="image.url"
      :alt="image.alt"
      :width="image.width"
      :height="image.height"
      :loading="isEager ? 'eager' : 'lazy'"
      :fetchpriority="isEager ? 'high' : undefined"
      decoding="async"
    >
  </div>
</template>

<style scoped>
/* One large photo on the left, the rest stacked on the right; the frame ratio is fixed, so nothing shifts on load. */
.attachment-gallery {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: var(--space-1);
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: var(--radius-md);
}

.attachment-gallery__image {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  object-fit: cover;
  background: var(--color-placeholder);
}

.attachment-gallery__image:first-child,
.attachment-gallery__image:nth-child(2):last-child {
  grid-row: 1 / -1;
}

.attachment-gallery__image:only-child {
  grid-column: 1 / -1;
}

@media (min-width: 640px) {
  .attachment-gallery {
    gap: var(--space-2);
    aspect-ratio: 16 / 10;
  }
}
</style>
