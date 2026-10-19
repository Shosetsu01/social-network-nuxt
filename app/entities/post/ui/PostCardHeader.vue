<script setup lang="ts">
import type { Post } from '#shared/types/post'
import { routes } from '@shared/config'
import { AppAvatar } from '@shared/ui'

interface Props {
  post: Post
  isEager?: boolean
  hasPostLinks?: boolean
}

withDefaults(defineProps<Props>(), { isEager: false, hasPostLinks: true })
</script>

<template>
  <header class="post-card-header">
    <!-- A duplicate of the author name link: hidden from assistive tech and skipped by Tab. -->
    <NuxtLink
      class="post-card-header__avatar"
      :to="routes.user(post.author.id)"
      aria-hidden="true"
      tabindex="-1"
    >
      <AppAvatar
        :src="post.author.avatarUrl"
        :name="post.author.name"
        :is-eager="isEager"
      />
    </NuxtLink>
    <div class="post-card-header__body">
      <p class="post-card-header__headline">
        <NuxtLink
          class="post-card-header__link"
          :to="routes.user(post.author.id)"
        >
          {{ post.author.name }}
        </NuxtLink>
        <!-- Plain text (not an interpolation) right after the link: the compiler keeps its leading space. -->
        <template v-if="post.activity">
          <template v-if="post.activity.type === 'connection'">
            is now connected to
          </template>
          <template v-else>
            has checked in with
          </template>
          <NuxtLink
            class="post-card-header__link"
            :to="routes.user(post.activity.target.id)"
          >
            {{ post.activity.target.name }}
          </NuxtLink>
          <template v-if="post.activity.othersCount > 0">
            and <span class="post-card-header__others">
              {{ post.activity.othersCount }} {{ post.activity.othersCount === 1 ? 'other' : 'others' }}
            </span>
          </template>
          <template v-if="post.activity.type === 'check-in'">
            at {{ post.activity.place }}
          </template>.
        </template>
      </p>
      <NuxtLink
        v-if="hasPostLinks"
        class="post-card-header__time post-card-header__time-link"
        :to="routes.post(post.id)"
      >
        <NuxtTime
          :datetime="post.createdAt"
          relative
          locale="en-US"
        />
      </NuxtLink>
      <NuxtTime
        v-else
        class="post-card-header__time"
        :datetime="post.createdAt"
        relative
        locale="en-US"
      />
    </div>
  </header>
</template>

<style scoped>
.post-card-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.post-card-header__avatar {
  display: inline-flex;
  flex-shrink: 0;
  border-radius: var(--radius-full);
}

.post-card-header__body {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.post-card-header__headline {
  line-height: var(--line-height-tight);
  overflow-wrap: anywhere;
}

.post-card-header__link,
.post-card-header__others {
  font-weight: var(--font-weight-bold);
}

.post-card-header__link {
  color: var(--color-text);
  text-decoration: none;
}

.post-card-header__link:hover {
  text-decoration: underline;
}

.post-card-header__time {
  justify-self: start;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.post-card-header__time-link {
  text-decoration: none;
}

.post-card-header__time-link:hover {
  text-decoration: underline;
}
</style>
