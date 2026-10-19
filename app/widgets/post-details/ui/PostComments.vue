<script setup lang="ts">
import type { PostComment } from '#shared/types/post'
import { UserLink } from '@entities/user'

interface Props {
  comments: PostComment[]
}

defineProps<Props>()

const headingId = useId()
</script>

<template>
  <section
    class="post-comments"
    :aria-labelledby="headingId"
  >
    <h2
      :id="headingId"
      class="post-comments__title"
    >
      Comments
    </h2>
    <ul
      v-if="comments.length > 0"
      class="post-comments__list"
      aria-label="Comments"
    >
      <li
        v-for="comment in comments"
        :key="comment.id"
        class="post-comments__item"
        data-testid="comment"
      >
        <div class="post-comments__meta">
          <UserLink :user="comment.author" />
          <NuxtTime
            class="post-comments__time"
            :datetime="comment.createdAt"
            relative
            locale="en-US"
          />
        </div>
        <p class="post-comments__text">
          {{ comment.text }}
        </p>
      </li>
    </ul>
    <p
      v-else
      class="post-comments__empty"
    >
      No comments yet.
    </p>
  </section>
</template>

<style scoped>
.post-comments {
  padding: var(--space-4);
  background: var(--color-surface);
}

.post-comments__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-black);
}

.post-comments__list {
  margin: var(--space-3) 0 0;
  padding: 0;
  list-style: none;
}

.post-comments__item {
  display: grid;
  gap: var(--space-1);
  padding-block: var(--space-3);
}

.post-comments__item + .post-comments__item {
  border-top: 1px solid var(--color-border);
}

.post-comments__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-1) var(--space-3);
}

.post-comments__time {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

/* Lines up with the author name: avatar (40px) plus the link gap. */
.post-comments__text {
  padding-inline-start: calc(40px + var(--space-3));
  overflow-wrap: anywhere;
}

.post-comments__empty {
  margin-top: var(--space-3);
  color: var(--color-text-muted);
}

@media (min-width: 640px) {
  .post-comments {
    padding: var(--space-5);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }
}
</style>
