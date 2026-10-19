<script setup lang="ts">
import { useFeedStore } from '@entities/post'
import { AppButton, AppIcon } from '@shared/ui'

interface Props {
  postId: string
  isBookmarked: boolean
}

const props = defineProps<Props>()

const feed = useFeedStore()

function toggle(): void {
  feed.toggleBookmark(props.postId)
}
</script>

<template>
  <!-- The wrapper owns the color: AppButton's ghost variant inherits it, so no specificity fight with its styles. -->
  <span
    class="bookmark-button"
    :class="{ 'bookmark-button--active': isBookmarked }"
  >
    <AppButton
      variant="ghost"
      aria-label="Bookmark"
      :aria-pressed="isBookmarked"
      @click="toggle"
    >
      <AppIcon
        name="bookmark"
        :is-filled="isBookmarked"
      />
    </AppButton>
  </span>
</template>

<style scoped>
.bookmark-button {
  display: inline-flex;
  color: var(--color-text-muted);
}

.bookmark-button--active {
  color: var(--color-brand-strong);
}
</style>
