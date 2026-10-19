<script setup lang="ts">
import AppButton from './AppButton.vue'

interface Props {
  message: string
}

defineProps<Props>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="error-state">
    <!-- The alert holds only the message, so "Retry" is not announced with it. -->
    <p
      class="error-state__message"
      role="alert"
    >
      {{ message }}
    </p>
    <AppButton
      variant="secondary"
      @click="$emit('retry')"
    >
      Retry
    </AppButton>
  </div>
</template>

<style scoped>
.error-state {
  display: grid;
  justify-items: center;
  gap: var(--space-4);
  padding: var(--space-7) var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.error-state__message {
  margin: 0;
  color: var(--color-danger);
  font-weight: var(--font-weight-bold);
}
</style>
