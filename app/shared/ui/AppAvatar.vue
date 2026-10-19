<script setup lang="ts">
import { getInitials } from '../lib'

interface Props {
  src: string
  name: string
  size?: number
  /** Empty by default: avatars usually sit next to the visible name. */
  alt?: string
  /** For first-screen avatars (header, profile): load immediately with high priority. */
  isEager?: boolean
}

const props = withDefaults(defineProps<Props>(), { size: 48, alt: '', isEager: false })

const image = useTemplateRef<HTMLImageElement>('image')
const hasError = ref(false)

const initials = computed(() => getInitials(props.name))
const hasLabelledFallback = computed(() => hasError.value && props.alt !== '')

watch(() => props.src, () => {
  hasError.value = false
})

onMounted(() => {
  // An image that failed before hydration never fires @error on the client.
  if (image.value?.complete && image.value.naturalWidth === 0) {
    hasError.value = true
  }
})
</script>

<template>
  <span
    class="app-avatar"
    :style="{ '--avatar-size': `${size}px` }"
    :role="hasLabelledFallback ? 'img' : undefined"
    :aria-label="hasLabelledFallback ? alt : undefined"
  >
    <img
      v-if="!hasError"
      ref="image"
      class="app-avatar__image"
      :src="src"
      :alt="alt"
      :width="size"
      :height="size"
      :loading="isEager ? 'eager' : 'lazy'"
      :fetchpriority="isEager ? 'high' : undefined"
      decoding="async"
      @error="hasError = true"
    >
    <span
      v-else
      class="app-avatar__initials"
      aria-hidden="true"
    >{{ initials }}</span>
  </span>
</template>

<style scoped>
.app-avatar {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: var(--avatar-size);
  height: var(--avatar-size);
  overflow: hidden;
  border-radius: var(--radius-full);
  background: var(--color-placeholder);
  color: var(--color-text-muted);
  box-shadow: var(--shadow-sm);
}

.app-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-avatar__initials {
  font-size: calc(var(--avatar-size) * 0.4);
  font-weight: var(--font-weight-bold);
  line-height: 1;
}
</style>
