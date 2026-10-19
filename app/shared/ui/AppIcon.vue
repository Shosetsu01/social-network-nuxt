<script setup lang="ts">
import { ICON_PATHS, type IconName } from './icons'

interface Props {
  name: IconName
  size?: number
  isFilled?: boolean
}

const props = withDefaults(defineProps<Props>(), { size: 24, isFilled: false })

const paths = computed(() => ICON_PATHS[props.name])
</script>

<template>
  <!-- Always decorative: the accessible name belongs to the surrounding control or text. -->
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    :fill="isFilled ? 'currentColor' : 'none'"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path
      v-for="d in paths"
      :key="d"
      :d="d"
    />
  </svg>
</template>

<style scoped>
.app-icon {
  display: block;
  flex-shrink: 0;
}
</style>
