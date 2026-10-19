<script setup lang="ts">
import type { MediaImage } from '#shared/types/post'
import { AppIcon } from '@shared/ui'

interface Props {
  poster: MediaImage
  isEager?: boolean
}

withDefaults(defineProps<Props>(), { isEager: false })
</script>

<template>
  <!-- Preview only: the original has no player, so the play mark is decorative, not a control. -->
  <div class="attachment-video">
    <img
      class="attachment-video__poster"
      :src="poster.url"
      :alt="`Video preview: ${poster.alt}`"
      :width="poster.width"
      :height="poster.height"
      :style="{ aspectRatio: `${poster.width} / ${poster.height}` }"
      :loading="isEager ? 'eager' : 'lazy'"
      decoding="async"
    >
    <span class="attachment-video__play">
      <AppIcon
        name="play"
        :size="28"
        is-filled
      />
    </span>
  </div>
</template>

<style scoped>
.attachment-video {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md);
}

.attachment-video__poster {
  width: 100%;
  height: auto;
  object-fit: cover;
  background: var(--color-placeholder);
}

.attachment-video__play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--tap-size) * 1.5);
  height: calc(var(--tap-size) * 1.5);
  margin: auto;
  border-radius: var(--radius-full);
  background: var(--color-overlay);
  color: var(--color-surface);
}
</style>
