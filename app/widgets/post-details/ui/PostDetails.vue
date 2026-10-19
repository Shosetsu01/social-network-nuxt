<script setup lang="ts">
import type { Post, PostComment } from '#shared/types/post'
import { PostCard } from '@entities/post'
import { BookmarkButton } from '@features/toggle-bookmark'
import { LikeButton } from '@features/toggle-like'
import { AppSpinner, ErrorState } from '@shared/ui'
import PostComments from './PostComments.vue'

interface Props {
  post: Post
  /** Absent while the request is in flight or failed: the card is already known from the feed store. */
  comments?: PostComment[]
  hasError?: boolean
}

withDefaults(defineProps<Props>(), { comments: undefined, hasError: false })
defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="post-details">
    <h1 class="visually-hidden">
      Post by {{ post.author.name }}
    </h1>
    <div class="post-details__card">
      <PostCard
        :post="post"
        is-eager
        :has-post-links="false"
      >
        <template #actions>
          <LikeButton
            :post-id="post.id"
            :is-liked="post.isLiked"
            :count="post.likes"
          />
          <BookmarkButton
            :post-id="post.id"
            :is-bookmarked="post.isBookmarked"
          />
        </template>
      </PostCard>
    </div>
    <PostComments
      v-if="comments"
      :comments="comments"
    />
    <ErrorState
      v-else-if="hasError"
      class="post-details__error"
      message="Could not load the post."
      @retry="$emit('retry')"
    />
    <div
      v-else
      class="post-details__loading"
      aria-busy="true"
    >
      <AppSpinner :size="24" />
      <p class="visually-hidden">
        Loading comments…
      </p>
    </div>
  </div>
</template>

<style scoped>
.post-details {
  display: grid;
  gap: var(--space-4);
}

.post-details__card {
  background: var(--color-surface);
}

.post-details__error {
  margin-inline: var(--space-4);
}

.post-details__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(var(--tap-size) * 2);
  color: var(--color-text-muted);
}

@media (min-width: 640px) {
  .post-details {
    gap: var(--space-5);
  }

  .post-details__error {
    margin-inline: 0;
  }

  .post-details__card {
    overflow: hidden;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }
}
</style>
