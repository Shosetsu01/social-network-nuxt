<script setup lang="ts">
import { formatCompactNumber } from '@shared/lib'

interface Props {
  followers: number
  following: number
  posts: number
}

const props = defineProps<Props>()

const stats = computed(() => [
  { label: 'Followers', value: formatCompactNumber(props.followers) },
  { label: 'Following', value: formatCompactNumber(props.following) },
  { label: 'Posts', value: formatCompactNumber(props.posts) },
])
</script>

<template>
  <dl
    class="profile-stats"
    data-testid="profile-stats"
  >
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="profile-stats__item"
    >
      <dt class="profile-stats__label">
        {{ stat.label }}
      </dt>
      <dd class="profile-stats__value">
        {{ stat.value }}
      </dd>
    </div>
  </dl>
</template>

<style scoped>
.profile-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  width: 100%;
  padding-block: var(--space-3);
  border-block: 1px solid var(--color-border);
}

/* Label under the number visually; dt stays first in the DOM, as the dl content model requires. */
.profile-stats__item {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: var(--space-1);
}

.profile-stats__item + .profile-stats__item {
  border-inline-start: 1px solid var(--color-border);
}

.profile-stats__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

/* 24px bold is large text: --color-brand-strong (3.8:1) meets AA for it. */
.profile-stats__value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-black);
  line-height: var(--line-height-tight);
  color: var(--color-brand-strong);
}
</style>
