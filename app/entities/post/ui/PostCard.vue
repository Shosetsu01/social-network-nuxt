<script setup lang="ts">
import type { Post } from '#shared/types/post'
import { AppIcon } from '@shared/ui'
import PostAttachment from './PostAttachment.vue'
import PostCardHeader from './PostCardHeader.vue'

interface Props {
  post: Post
  /** Set for the first card: its avatar and media are on the first screen. */
  isEager?: boolean
}

withDefaults(defineProps<Props>(), { isEager: false })

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
      <p class="post-card__comments">
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
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
}

@media (min-width: 640px) {
  .post-card {
    padding: var(--space-5) var(--space-5) var(--space-3);
  }
}
</style>
