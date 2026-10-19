<script setup lang="ts">
import type { User } from '@entities/user'
import { AppAvatar, AppIcon } from '@shared/ui'

interface Props {
  user: User
}

defineProps<Props>()
</script>

<template>
  <div class="profile-header">
    <AppAvatar
      class="profile-header__avatar"
      :src="user.avatarUrl"
      :name="user.name"
      :size="96"
      is-eager
    />
    <h1 class="profile-header__name">
      {{ user.name }}
    </h1>
    <p class="profile-header__meta">
      <AppIcon
        class="profile-header__icon"
        name="briefcase"
        :size="16"
      />
      {{ user.role }} · {{ user.company }}
    </p>
    <p class="profile-header__meta">
      <AppIcon
        class="profile-header__icon"
        name="map-pin"
        :size="16"
      />
      {{ user.location }}
    </p>
  </div>
</template>

<style scoped>
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  text-align: center;
}

.profile-header__avatar {
  border: 4px solid var(--color-surface);
  box-shadow: var(--shadow-md);
}

.profile-header__name {
  margin-top: var(--space-2);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-black);
  line-height: var(--line-height-tight);
  overflow-wrap: anywhere;
}

.profile-header__meta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
}

.profile-header__icon {
  color: var(--color-brand-strong);
}

@media (min-width: 640px) {
  .profile-header__name {
    font-size: var(--font-size-2xl);
  }
}
</style>
