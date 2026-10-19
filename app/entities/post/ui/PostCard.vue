<script setup lang="ts">
import type { Post } from '#shared/types/post'
import { routes } from '@shared/config'
import { AppIcon } from '@shared/ui'
import PostAttachment from './PostAttachment.vue'
import PostCardHeader from './PostCardHeader.vue'

interface Props {
  post: Post
  /** Set for the first card: its avatar and media are on the first screen. */
  isEager?: boolean
  /** Off on the post page: the time and the comment counter must not link to the page itself. */
  hasPostLinks?: boolean
}

withDefaults(defineProps<Props>(), { isEager: false, hasPostLinks: true })

// Actions (like, bookmark) are features: the entity cannot import them, so the widget passes them in.
defineSlots<{ actions?: () => unknown }>()
</script>

<template>
  <article
    class="post-card"
    data-testid="post-card"
  >
    <PostCardHeader
      :post="post"
      :is-eager="isEager"
      :has-post-links="hasPostLinks"
    />
    <p
      v-if="post.text"
      class="post-card__text"
    >
      {{ post.text }}
    </p>
    <PostAttachment
      v-if="post.attachment"
      :attachment="post.attachment"
      :is-eager="isEager"
    />
    <footer class="post-card__footer">
      <div class="post-card__actions">
        <slot name="actions" />
      </div>
      <NuxtLink
        v-if="hasPostLinks"
        class="post-card__comments post-card__comments-link"
        :to="routes.post(post.id)"
      >
        <AppIcon
          name="message-circle"
          :size="20"
        />
        <span data-testid="comment-count">{{ post.comments }}</span>
        <span class="visually-hidden"> comments</span>
      </NuxtLink>
      <p
        v-else
        class="post-card__comments"
      >
        <AppIcon
          name="message-circle"
          :size="20"
        />
        <span data-testid="comment-count">{{ post.comments }}</span>
        <span class="visually-hidden"> comments</span>
      </p>
    </footer>
  </article>
</template>

<style scoped>
.post-card {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-4) var(--space-2);
}

.post-card__text {
  overflow-wrap: anywhere;
  white-space: pre-line;
}

.post-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.post-card__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-inline-start: calc(var(--space-3) * -1);
}

.post-card__comments {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--tap-size);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
}

.post-card__comments-link {
  padding-inline: var(--space-2);
  margin-inline-end: calc(var(--space-2) * -1);
  border-radius: var(--radius-sm);
  text-decoration: none;
}

.post-card__comments-link:hover {
  color: var(--color-text);
}

@media (min-width: 640px) {
  .post-card {
    padding: var(--space-5) var(--space-5) var(--space-3);
  }
}
</style>
