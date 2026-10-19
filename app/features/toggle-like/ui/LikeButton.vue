<script setup lang="ts">
import { useFeedStore } from '@entities/post'
import { AppButton, AppIcon } from '@shared/ui'

interface Props {
  postId: string
  isLiked: boolean
  count: number
}

const props = defineProps<Props>()

const feed = useFeedStore()
const countId = useId()

function toggle(): void {
  feed.toggleLike(props.postId)
}
</script>

<template>
  <span
    class="like-button"
    :class="{ 'like-button--active': isLiked }"
  >
    <!-- The name stays "Like" in both states: the state is aria-pressed, the count is a description.
         The wrapper owns the color, which the ghost AppButton inherits. -->
    <AppButton
      variant="ghost"
      aria-label="Like"
      :aria-pressed="isLiked"
      :aria-describedby="countId"
      @click="toggle"
    >
      <AppIcon
        name="thumbs-up"
        :is-filled="isLiked"
      />
    </AppButton>
    <span
      :id="countId"
      class="like-button__count"
    >
      <span data-testid="like-count">{{ count }}</span>
      <span class="visually-hidden"> likes</span>
    </span>
  </span>
</template>

<style scoped>
.like-button {
  display: inline-flex;
  align-items: center;
  color: var(--color-text-muted);
}

.like-button--active {
  color: var(--color-brand-strong);
}

.like-button__count {
  min-width: 3ch;
  font-weight: var(--font-weight-bold);
  font-variant-numeric: tabular-nums;
  color: var(--color-text-muted);
}
</style>
