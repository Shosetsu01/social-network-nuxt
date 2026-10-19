<template>
  <!-- Mirrors the card geometry (paddings, avatar, media ratio, footer height) so cards replace it without a jump. -->
  <div
    class="post-skeleton"
    data-testid="post-skeleton"
    aria-hidden="true"
  >
    <div class="post-skeleton__header">
      <span class="post-skeleton__block post-skeleton__avatar" />
      <span class="post-skeleton__lines">
        <span class="post-skeleton__block post-skeleton__line" />
        <span class="post-skeleton__block post-skeleton__line post-skeleton__line--short" />
      </span>
    </div>
    <span class="post-skeleton__block post-skeleton__media" />
    <span class="post-skeleton__footer">
      <span class="post-skeleton__block post-skeleton__line post-skeleton__line--short" />
    </span>
  </div>
</template>

<style scoped>
.post-skeleton {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-4) var(--space-2);
}

.post-skeleton__block {
  display: block;
  background: var(--color-placeholder);
  animation: post-skeleton-pulse 1.4s ease-in-out infinite;
}

.post-skeleton__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.post-skeleton__avatar {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
}

.post-skeleton__lines {
  display: grid;
  flex: 1;
  gap: var(--space-2);
}

.post-skeleton__line {
  width: 70%;
  height: var(--font-size-md);
  border-radius: var(--radius-sm);
}

.post-skeleton__line--short {
  width: 30%;
}

.post-skeleton__media {
  aspect-ratio: 3 / 2;
  border-radius: var(--radius-md);
}

.post-skeleton__footer {
  display: flex;
  align-items: center;
  min-height: var(--tap-size);
}

@keyframes post-skeleton-pulse {
  50% {
    opacity: 0.5;
  }
}

@media (min-width: 640px) {
  .post-skeleton {
    padding: var(--space-5) var(--space-5) var(--space-3);
  }
}
</style>
