<script setup lang="ts">
import AppIcon from './AppIcon.vue'

interface Props {
  title: string
  tag: string
  /** ISO 8601 */
  publishedAt: string
}

defineProps<Props>()
</script>

<template>
  <div class="sound-byte">
    <span class="sound-byte__icon">
      <AppIcon name="mic" />
    </span>
    <div class="sound-byte__body">
      <p class="sound-byte__title">
        {{ title }}
      </p>
      <p class="sound-byte__meta">
        <span class="sound-byte__tag">{{ tag }}</span>
        <NuxtTime
          class="sound-byte__date"
          :datetime="publishedAt"
          locale="en-US"
          month="short"
          day="numeric"
          year="numeric"
        />
      </p>
    </div>
  </div>
</template>

<style scoped>
.sound-byte {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.sound-byte__icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: var(--tap-size);
  height: var(--tap-size);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-brand-strong);
}

.sound-byte__body {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.sound-byte__title {
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  overflow-wrap: anywhere;
}

.sound-byte__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.sound-byte__tag {
  padding: 0 var(--space-2);
  border-radius: var(--radius-full);
  background: var(--color-brand);
  color: var(--color-on-brand);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-normal);
}
</style>
