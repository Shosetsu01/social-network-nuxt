<script setup lang="ts">
import type { UserSummary } from '#shared/types/user'
import { routes } from '@shared/config'
import { AppAvatar } from '@shared/ui'

interface Props {
  user: UserSummary
}

defineProps<Props>()
</script>

<template>
  <NuxtLink
    class="user-link"
    :to="routes.user(user.id)"
  >
    <AppAvatar
      :src="user.avatarUrl"
      :name="user.name"
      :size="40"
    />
    <span class="user-link__name">{{ user.name }}</span>
  </NuxtLink>
</template>

<style scoped>
.user-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  min-height: var(--tap-size);
  max-width: 100%;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
  text-decoration: none;
}

.user-link__name {
  overflow-wrap: anywhere;
}

.user-link:hover .user-link__name {
  text-decoration: underline;
}
</style>
