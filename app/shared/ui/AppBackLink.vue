<script setup lang="ts">
import AppIcon from './AppIcon.vue'

interface Props {
  fallback: string
}

const props = defineProps<Props>()

const router = useRouter()

// Vue Router keeps the previous in-app URL in history.state.back; it is null on the first page of a visit.
function hasInAppHistory(): boolean {
  const state: unknown = window.history.state
  return typeof state === 'object' && state !== null && 'back' in state && typeof state.back === 'string'
}

// History is read on click only: the server cannot know it, so reading it in render would break hydration.
function goBack(): void {
  if (hasInAppHistory()) {
    router.back()
    return
  }
  void navigateTo(props.fallback)
}

function onClick(event: MouseEvent): void {
  // Same guard as RouterLink: let the browser open a new tab/window or download.
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
  event.preventDefault()
  goBack()
}
</script>

<template>
  <!-- A real link keeps a way out before hydration and for direct visits; the handler restores the previous page. -->
  <a
    class="app-back-link"
    :href="fallback"
    @click="onClick"
  >
    <AppIcon
      name="arrow-left"
      :size="20"
    />
    Back
  </a>
</template>

<style scoped>
.app-back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-width: var(--tap-size);
  min-height: var(--tap-size);
  padding: 0 var(--space-3);
  border-radius: var(--radius-full);
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
  text-decoration: none;
  transition: background-color var(--duration-fast) ease;
}

.app-back-link:hover {
  background: var(--color-placeholder);
}
</style>
