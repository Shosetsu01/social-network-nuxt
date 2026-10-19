<script setup lang="ts">
interface Props {
  size?: number
}

withDefaults(defineProps<Props>(), { size: 20 })
</script>

<template>
  <!-- Decorative: the busy state is announced by the owner (aria-busy, button name). -->
  <span
    class="app-spinner"
    :style="{ '--spinner-size': `${size}px` }"
    aria-hidden="true"
  />
</template>

<style scoped>
.app-spinner {
  display: inline-block;
  width: var(--spinner-size);
  height: var(--spinner-size);
  border: 2px solid currentcolor;
  border-right-color: transparent;
  border-radius: var(--radius-full);
  animation: app-spinner-rotate 0.7s linear infinite;
}

@keyframes app-spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>
