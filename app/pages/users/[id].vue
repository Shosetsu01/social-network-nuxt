<script setup lang="ts">
import { useSessionStore } from '@entities/session'
import { userService } from '@entities/user'
import { AppSpinner, ErrorState } from '@shared/ui'
import { UserProfile } from '@widgets/user-profile'

const NOT_FOUND_STATUS = 404

const route = useRoute()
const session = useSessionStore()

// `[id]` is a single segment, but the router types every param as string | string[].
const id = computed(() => {
  const param = route.params.id
  return (Array.isArray(param) ? param[0] : param) ?? ''
})

const { data: profile, status, error, refresh } = await useAsyncData(
  () => `user:${id.value}`,
  () => userService.getProfile(id.value),
  // The server still waits for the data; client navigation renders at once and shows the loading state.
  { lazy: true },
)

useHead({ title: () => (profile.value ? `${profile.value.user.name} · Socio Network` : 'Socio Network') })

const isOwnProfile = computed(() => session.user?.id === id.value)

// Only a missing user is a page-level error; other failures stay inline with a retry.
function throwIfNotFound(statusCode: number | undefined): void {
  if (statusCode === NOT_FOUND_STATUS) {
    throw createError({ statusCode: NOT_FOUND_STATUS, statusMessage: 'User not found', fatal: true })
  }
}

// SSR: the request has settled by now. `fatal` swaps the page for error.vue on the client too.
throwIfNotFound(error.value?.statusCode)

// Client navigation (lazy), an id change in a reused page and a retry settle after setup.
watch(error, value => throwIfNotFound(value?.statusCode))
</script>

<template>
  <div class="profile-page">
    <!-- After an id change the previous profile stays as placeholder data: render only a settled request. -->
    <UserProfile
      v-if="status === 'success' && profile"
      :profile="profile"
      :is-own-profile="isOwnProfile"
    />
    <ErrorState
      v-else-if="status === 'error'"
      message="Could not load the profile."
      @retry="refresh()"
    />
    <p
      v-else
      class="profile-page__state"
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

.profile-page__state {
  display: flex;
  flex-wrap: wrap;
  place-content: center;
  align-items: center;
  gap: var(--space-3);
  min-height: 16rem;
  color: var(--color-text-muted);
  text-align: center;
}

@media (min-width: 640px) {
  .profile-page {
    padding-block: var(--space-6);
  }
}
</style>
