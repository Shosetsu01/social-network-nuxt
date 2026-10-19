<script setup lang="ts">
import { useFeedStore } from '@entities/post'
import { PostFeed } from '@widgets/post-feed'

const feed = useFeedStore()

// SSR waits so the feed lands in the HTML and the Pinia payload; on the client navigation is not blocked
// and skeletons show. ensureLoaded is a no-op once loaded, so returning from a profile keeps likes.
if (import.meta.server) await feed.ensureLoaded()
else void feed.ensureLoaded()
</script>

<template>
  <div>
    <h1 class="visually-hidden">
      Feed
    </h1>
    <PostFeed />
  </div>
</template>
