<script setup lang="ts">
const STAT_COUNT = 3
</script>

<template>
  <!-- Mirrors the intro and bio cards of UserProfile (cover band, avatar, name, stats) so the profile replaces it without a jump. -->
  <div
    class="profile-skeleton"
    aria-hidden="true"
  >
    <div class="profile-skeleton__card profile-skeleton__card--intro">
      <span class="profile-skeleton__header">
        <span class="profile-skeleton__block profile-skeleton__avatar" />
        <span class="profile-skeleton__block profile-skeleton__name" />
        <span class="profile-skeleton__block profile-skeleton__meta" />
        <span class="profile-skeleton__block profile-skeleton__meta profile-skeleton__meta--short" />
      </span>
      <span class="profile-skeleton__stats">
        <span
          v-for="n in STAT_COUNT"
          :key="n"
          class="profile-skeleton__stat"
        >
          <span class="profile-skeleton__block profile-skeleton__stat-value" />
          <span class="profile-skeleton__block profile-skeleton__stat-label" />
        </span>
      </span>
    </div>

    <div class="profile-skeleton__card">
      <span class="profile-skeleton__block profile-skeleton__heading" />
      <span class="profile-skeleton__block profile-skeleton__line" />
      <span class="profile-skeleton__block profile-skeleton__line profile-skeleton__line--short" />
    </div>
  </div>
</template>

<style scoped>
.profile-skeleton {
  display: grid;
  gap: var(--space-4);
}

.profile-skeleton__card {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.profile-skeleton__card--intro {
  justify-items: center;
  gap: var(--space-4);
  overflow: hidden;
}

.profile-skeleton__card--intro::before {
  content: '';
  justify-self: stretch;
  height: 4.5rem;
  margin: calc(-1 * var(--space-4)) calc(-1 * var(--space-4)) 0;
  background: var(--color-placeholder);
}

/* Opaque at rest: with reduced motion the pulse is cut, and the static frame is plain grey shapes. */
.profile-skeleton__block {
  display: block;
  border-radius: var(--radius-sm);
  background: var(--color-placeholder);
  animation: profile-skeleton-pulse 1.4s ease-in-out infinite;
}

.profile-skeleton__header {
  display: grid;
  justify-items: center;
  gap: var(--space-2);
  width: 100%;
  margin-top: -4rem;
}

/* The surface ring separates the avatar from the cover band, as on the real profile. */
.profile-skeleton__avatar {
  width: 96px;
  height: 96px;
  border: 4px solid var(--color-surface);
  border-radius: var(--radius-full);
}

.profile-skeleton__name {
  width: min(14rem, 70%);
  height: var(--font-size-xl);
  margin-block: var(--space-2) var(--space-1);
}

.profile-skeleton__meta {
  width: min(11rem, 55%);
  height: var(--font-size-md);
  margin-block: var(--space-1);
}

.profile-skeleton__meta--short {
  width: min(7rem, 35%);
}

.profile-skeleton__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  width: 100%;
  padding-block: var(--space-3);
  border-block: 1px solid var(--color-border);
}

.profile-skeleton__stat {
  display: grid;
  justify-items: center;
  gap: var(--space-2);
}

.profile-skeleton__stat + .profile-skeleton__stat {
  border-inline-start: 1px solid var(--color-border);
}

.profile-skeleton__stat-value {
  width: 3rem;
  height: var(--font-size-xl);
}

.profile-skeleton__stat-label {
  width: 4.5rem;
  height: var(--font-size-sm);
}

.profile-skeleton__heading {
  width: 5rem;
  height: var(--font-size-lg);
}

.profile-skeleton__line {
  width: 100%;
  height: var(--font-size-md);
}

.profile-skeleton__line--short {
  width: 60%;
}

@keyframes profile-skeleton-pulse {
  50% {
    opacity: 0.5;
  }
}

@media (min-width: 640px) {
  .profile-skeleton {
    gap: var(--space-5);
  }

  .profile-skeleton__card {
    padding: var(--space-5);
  }

  .profile-skeleton__card--intro::before {
    height: 5.5rem;
    margin: calc(-1 * var(--space-5)) calc(-1 * var(--space-5)) 0;
  }

  .profile-skeleton__name {
    height: var(--font-size-2xl);
  }
}
</style>
