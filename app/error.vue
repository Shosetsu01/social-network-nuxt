<script setup lang="ts">
import type { NuxtError } from '#app'
import { routes } from '@shared/config'
import { isPlainClick } from '@shared/lib'

interface Props {
  error: NuxtError
}

const props = defineProps<Props>()

// Fixed copy only: the error message may carry internals and is never rendered.
const isNotFound = computed(() => props.error.statusCode === 404)
const title = computed(() => (isNotFound.value ? 'Page not found' : 'Something went wrong'))
const description = computed(() => (isNotFound.value
  ? 'The page you are looking for does not exist or has been moved.'
  : 'We could not load this page. Please try again in a moment.'))

useHead({ title: () => `${title.value} · Socio Network` })

function backToFeed(event: MouseEvent): void {
  if (!isPlainClick(event)) return
  event.preventDefault()
  void clearError({ redirect: routes.home })
}
</script>

<template>
  <main class="error-page">
    <p
      class="error-page__code"
      aria-hidden="true"
    >
      {{ error.statusCode }}
    </p>
    <h1 class="error-page__title">
      {{ title }}
    </h1>
    <p class="error-page__description">
      {{ description }}
    </p>
    <!-- A real link keeps the way out working before hydration; the handler also resets the error state. -->
    <a
      class="error-page__link"
      :href="routes.home"
      @click="backToFeed"
    >
      Back to feed
    </a>
  </main>
</template>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  width: 100%;
  max-width: var(--content-max-width);
  min-height: 100vh;
  min-height: 100dvh;
  margin-inline: auto;
  padding: var(--space-6) var(--space-4);
  text-align: center;
}

.error-page__code {
  font-size: calc(var(--font-size-2xl) * 2);
  font-weight: var(--font-weight-black);
  line-height: 1;
  color: var(--color-brand-strong);
}

.error-page__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-black);
  line-height: var(--line-height-tight);
}

.error-page__description {
  color: var(--color-text-muted);
}

.error-page__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--tap-size);
  margin-top: var(--space-3);
  padding: 0 var(--space-5);
  border-radius: var(--radius-full);
  background: var(--color-brand);
  color: var(--color-on-brand);
  font-weight: var(--font-weight-bold);
  text-decoration: none;
  transition: background-color var(--duration-fast) ease;
}

.error-page__link:hover {
  background: var(--color-brand-hover);
}

@media (min-width: 640px) {
  .error-page__code {
    font-size: calc(var(--font-size-2xl) * 3);
  }

  .error-page__title {
    font-size: var(--font-size-2xl);
  }
}
</style>
