<script setup lang="ts">
import type { NuxtError } from '#app'
import { useSessionStore } from '@entities/session'
import { userService } from '@entities/user'
import { AppSpinner } from '@shared/ui'
import { UserProfile } from '@widgets/user-profile'

const route = useRoute()
const session = useSessionStore()

// `[id]` is a single segment, but the router types every param as string | string[].
const id = computed(() => {
  const param = route.params.id
  return (Array.isArray(param) ? param[0] : param) ?? ''
})

const { data: profile, status, error } = await useAsyncData(
  () => `user:${id.value}`,
  () => userService.getProfile(id.value),
  // The server still waits for the data; client navigation renders at once and shows the loading state.
  { lazy: true },
)

useHead({ title: () => (profile.value ? `${profile.value.user.name} · Socio Network` : 'Socio Network') })

const isOwnProfile = computed(() => session.user?.id === id.value)

function toPageError(cause: NuxtError): NuxtError {
  return cause.statusCode === 404
    ? createError({ statusCode: 404, statusMessage: 'User not found', fatal: true })
    : createError({ statusCode: cause.statusCode, statusMessage: 'Could not load the profile', fatal: true })
}

// SSR: the request has settled by now. `fatal` swaps the page for error.vue on the client too.
if (error.value) throw toPageError(error.value)

// Client navigation (lazy) and an id change in a reused page settle after setup.
watch(error, (value) => {
  if (value) throw toPageError(value)
})
</script>

<template>
  <div class="profile-page">
    <!-- After an id change the previous profile stays as placeholder data: render only a settled request. -->
    <UserProfile
      v-if="status === 'success' && profile"
      :profile="profile"
      :is-own-profile="isOwnProfile"
    />
    <p
      v-else
      class="profile-page__loading"
      role="status"
    >
      <AppSpinner :size="24" />
      Loading profile…
    </p>
  </div>
</template>

<style scoped>
.profile-page {
  width: 100%;
  max-width: var(--content-max-width);
  margin-inline: auto;
  padding: var(--space-4);
}

.profile-page__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  min-height: 16rem;
  color: var(--color-text-muted);
}

@media (min-width: 640px) {
  .profile-page {
    padding-block: var(--space-6);
  }
}
</style>
