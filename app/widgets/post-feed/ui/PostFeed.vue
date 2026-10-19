<script setup lang="ts">
import { PostCard, PostCardSkeleton, useFeedStore } from '@entities/post'
import { BookmarkButton } from '@features/toggle-bookmark'
import { LikeButton } from '@features/toggle-like'
import { AppButton } from '@shared/ui'

const SKELETON_COUNT = 3

const feed = useFeedStore()
</script>

<template>
  <section class="post-feed">
    <div
      v-if="feed.status === 'error'"
      class="post-feed__state"
    >
      <p role="alert">
        {{ feed.error }}
      </p>
      <AppButton
        variant="secondary"
        @click="feed.reload()"
      >
        Retry
      </AppButton>
    </div>

    <p
      v-else-if="feed.status === 'success' && feed.posts.length === 0"
      class="post-feed__state"
    >
      No posts yet.
    </p>

    <ul
      v-else-if="feed.status === 'success'"
      class="post-feed__list"
    >
      <li
        v-for="(post, index) in feed.posts"
        :key="post.id"
        class="post-feed__item"
      >
        <PostCard
          :post="post"
          :is-eager="index === 0"
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
      </li>
    </ul>

    <!-- idle and pending: the client navigated here before the feed arrived. -->
    <div
      v-else
      class="post-feed__list"
      aria-busy="true"
    >
      <p class="visually-hidden">
        Loading posts…
      </p>
      <PostCardSkeleton
        v-for="n in SKELETON_COUNT"
        :key="n"
        class="post-feed__item"
      />
    </div>
  </section>
</template>

<style scoped>
.post-feed {
  width: 100%;
  max-width: var(--content-max-width);
  margin-inline: auto;
  background: var(--color-surface);
}

.post-feed__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Thin dividers between cards, as in the original. */
.post-feed__item + .post-feed__item {
  border-top: 1px solid var(--color-border);
}

.post-feed__state {
  display: grid;
  justify-items: center;
  gap: var(--space-4);
  padding: var(--space-7) var(--space-4);
  text-align: center;
  color: var(--color-text-muted);
}

@media (min-width: 640px) {
  .post-feed {
    margin-block: var(--space-5);
    overflow: hidden;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }
}
</style>
