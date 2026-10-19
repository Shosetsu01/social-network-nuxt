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
  >
    <span class="app-spinner__dot" />
    <span class="app-spinner__dot" />
    <span class="app-spinner__dot" />
  </span>
</template>

<style scoped>
.app-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: var(--spinner-size);
  height: var(--spinner-size);
}

/*
 * The resting style is the full dot: with reduced motion the animation is cut to one instant run,
 * so the static frame is a plain "•••" that still reads as "in progress".
 */
.app-spinner__dot {
  width: 28%;
  aspect-ratio: 1;
  border-radius: var(--radius-full);
  background: currentcolor;
  animation: app-spinner-pulse 1s ease-in-out infinite;
}

.app-spinner__dot:nth-child(1) {
  animation-delay: -0.3s;
}

.app-spinner__dot:nth-child(2) {
  animation-delay: -0.15s;
}

@keyframes app-spinner-pulse {
  0%,
  80%,
  100% {
    opacity: 0.35;
    transform: scale(0.6);
  }

  40% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
