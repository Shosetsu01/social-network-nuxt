<script setup lang="ts">
import type { UserProfileResponse } from '@entities/user'
import { LogoutButton } from '@features/logout'
import { SoundByteCard } from '@shared/ui'
import ProfileConnections from './ProfileConnections.vue'
import ProfileHeader from './ProfileHeader.vue'
import ProfileStats from './ProfileStats.vue'

interface Props {
  profile: UserProfileResponse
  isOwnProfile: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="user-profile">
    <div class="user-profile__card user-profile__card--intro">
      <ProfileHeader
        class="user-profile__header"
        :user="profile.user"
      />
      <ProfileStats
        :followers="profile.user.followers"
        :following="profile.user.following"
        :posts="profile.user.postsCount"
      />
      <LogoutButton v-if="isOwnProfile" />
    </div>

    <section class="user-profile__card">
      <h2 class="user-profile__heading">
        Bio
      </h2>
      <p
        class="user-profile__bio"
        data-testid="profile-bio"
      >
        {{ profile.user.bio }}
      </p>
    </section>

    <section class="user-profile__card">
      <h2 class="user-profile__heading">
        Connections
      </h2>
      <ProfileConnections :connections="profile.connections" />
    </section>

    <section class="user-profile__card">
      <h2 class="user-profile__heading">
        Sound Bytes
      </h2>
      <ul
        v-if="profile.soundBytes.length > 0"
        class="user-profile__sound-bytes"
      >
        <li
          v-for="soundByte in profile.soundBytes"
          :key="soundByte.id"
        >
          <SoundByteCard
            :title="soundByte.title"
            :tag="soundByte.tag"
            :published-at="soundByte.publishedAt"
          />
        </li>
      </ul>
      <p
        v-else
        class="user-profile__empty"
      >
        No sound bytes yet.
      </p>
    </section>
  </div>
</template>

<style scoped>
.user-profile {
  display: grid;
  gap: var(--space-4);
}

.user-profile__card {
  display: grid;
  gap: var(--space-3);
  min-width: 0;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.user-profile__card--intro {
  justify-items: center;
  gap: var(--space-4);
  overflow: hidden;
}

/* Brand cover band behind the avatar, as in the original profile screen. */
.user-profile__card--intro::before {
  content: '';
  justify-self: stretch;
  height: 4.5rem;
  margin: calc(-1 * var(--space-4)) calc(-1 * var(--space-4)) 0;
  background: var(--color-brand);
}

.user-profile__header {
  margin-top: -4rem;
}

.user-profile__heading {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

.user-profile__heading::before {
  content: '';
  width: 4px;
  height: 1.1em;
  border-radius: var(--radius-full);
  background: var(--color-brand);
}

.user-profile__bio {
  overflow-wrap: anywhere;
}

.user-profile__sound-bytes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.user-profile__empty {
  color: var(--color-text-muted);
}

@media (min-width: 640px) {
  .user-profile {
    gap: var(--space-5);
  }

  .user-profile__card {
    padding: var(--space-5);
  }

  .user-profile__card--intro::before {
    height: 5.5rem;
    margin: calc(-1 * var(--space-5)) calc(-1 * var(--space-5)) 0;
  }
}
</style>
