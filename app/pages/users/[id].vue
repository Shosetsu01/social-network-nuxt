<script setup lang="ts">
import { useSessionStore } from '@entities/session'
import { userService } from '@entities/user'
import { routes } from '@shared/config'
import { AppBackLink, ErrorState } from '@shared/ui'
import { ProfileSkeleton, UserProfile } from '@widgets/user-profile'

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
    <!-- Known before the data arrives, so the way back is there while the profile loads or fails. -->
    <AppBackLink
      v-if="!isOwnProfile"
      class="profile-page__back"
      :fallback="routes.home"
    />
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
    <div
      v-else
      aria-busy="true"
      data-testid="profile-skeleton"
    >
      <p class="visually-hidden">
        Loading profile…
      </p>
      <ProfileSkeleton />
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-3);
  width: 100%;
  max-width: var(--content-max-width);
  margin-inline: auto;
  padding: var(--space-4);
}

/* Optical alignment: the arrow lines up with the card edge, the padding stays part of the tap target. */
.profile-page__back {
  justify-self: start;
  margin-inline-start: calc(-1 * var(--space-3));
}

@media (min-width: 640px) {
  .profile-page {
    padding-block: var(--space-6);
  }
}
</style>
