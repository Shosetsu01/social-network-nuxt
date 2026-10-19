<script setup lang="ts">
import AppSpinner from './AppSpinner.vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost'
  type?: 'button' | 'submit'
  isLoading?: boolean
  isDisabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'button',
  isLoading: false,
  isDisabled: false,
})
</script>

<template>
  <button
    :type="type"
    class="app-button"
    :class="`app-button--${variant}`"
    :disabled="isDisabled || isLoading"
    :aria-busy="isLoading || undefined"
  >
    <!-- The label stays in the accessibility tree while loading, so the button name never changes. -->
    <span
      class="app-button__label"
      :class="{ 'app-button__label--hidden': isLoading }"
    >
      <slot />
    </span>
    <AppSpinner
      v-if="isLoading"
      class="app-button__spinner"
    />
  </button>
</template>

<style scoped>
.app-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--tap-size);
  min-height: var(--tap-size);
  padding: 0 var(--space-5);
  border: 2px solid transparent;
  border-radius: var(--radius-full);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  cursor: pointer;
  transition: background-color var(--duration-fast) ease, border-color var(--duration-fast) ease;
}

.app-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.app-button[aria-busy='true'] {
  cursor: progress;
  opacity: 1;
}

.app-button__label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.app-button__label--hidden {
  opacity: 0;
}

.app-button__spinner {
  position: absolute;
  inset: 0;
  margin: auto;
}

.app-button--primary {
  background: var(--color-brand);
  color: var(--color-on-brand);
}

.app-button--primary:hover:not(:disabled) {
  background: var(--color-brand-hover);
}

.app-button--secondary {
  background: var(--color-surface);
  border-color: var(--color-border-strong);
  color: var(--color-text);
}

.app-button--secondary:hover:not(:disabled) {
  background: var(--color-bg);
}

.app-button--ghost {
  padding: 0 var(--space-3);
  background: transparent;
  color: inherit;
}

.app-button--ghost:hover:not(:disabled) {
  background: var(--color-placeholder);
}
</style>
