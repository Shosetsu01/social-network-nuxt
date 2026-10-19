<script setup lang="ts">
import { useFeedStore } from '@entities/post'
import { useSessionStore } from '@entities/session'
import { routes } from '@shared/config'
import { AppButton, AppIcon } from '@shared/ui'

const session = useSessionStore()
const feed = useFeedStore()

async function logout(): Promise<void> {
  session.logout()
  // Likes and bookmarks live in the feed store: the next session must start clean.
  feed.reset()
  await navigateTo(routes.login, { replace: true })
}
</script>

<template>
  <AppButton
    variant="secondary"
    @click="logout"
  >
    <AppIcon
      name="log-out"
      :size="20"
    />
    Log out
  </AppButton>
</template>
