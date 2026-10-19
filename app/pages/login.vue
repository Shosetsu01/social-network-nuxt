<script setup lang="ts">
import { LoginForm } from '@features/auth-by-email'
import { routes } from '@shared/config'
import { safeRedirect } from '@shared/lib'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Log in · Socio Network' })

const route = useRoute()
const router = useRouter()

function redirectTarget(): string {
  const path = safeRedirect(route.query.redirect)
  // safeRedirect only keeps the target on this origin; an unknown path would land on the 404 page.
  return router.resolve(path).matched.length > 0 ? path : routes.home
}

async function onSuccess(): Promise<void> {
  await navigateTo(redirectTarget(), { replace: true })
}
</script>

<template>
  <div class="login-page">
    <h1 class="login-page__title">
      Log in
    </h1>
    <LoginForm @success="onSuccess" />
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.login-page__title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}
</style>
