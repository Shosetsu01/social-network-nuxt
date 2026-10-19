<script setup lang="ts">
import type { Post, PostComment } from '#shared/types/post'
import { PostCard } from '@entities/post'
import { BookmarkButton } from '@features/toggle-bookmark'
import { LikeButton } from '@features/toggle-like'
import PostComments from './PostComments.vue'

interface Props {
  post: Post
  comments: PostComment[]
}

defineProps<Props>()
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
    <PostComments :comments="comments" />
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

@media (min-width: 640px) {
  .post-details {
    gap: var(--space-5);
  }

  .post-details__card {
    overflow: hidden;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }
}
</style>
