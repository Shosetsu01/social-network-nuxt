<script setup lang="ts">
import { useSessionStore } from '@entities/session'
import { routes } from '@shared/config'
import { AppIcon } from '@shared/ui'

const session = useSessionStore()
</script>

<template>
  <!-- Mobile navigation; from 640px the header nav takes over (CSS only, no width detection). -->
  <nav
    class="bottom-nav"
    aria-label="Main"
  >
    <ul class="bottom-nav__list">
      <li class="bottom-nav__item">
        <!-- RouterLink sets aria-current="page" on the exact-active link. -->
        <NuxtLink
          class="bottom-nav__link"
          :to="routes.home"
        >
          <AppIcon
            class="bottom-nav__icon"
            name="home"
          />
          Home
        </NuxtLink>
      </li>
      <li
        v-if="session.user"
        class="bottom-nav__item"
      >
        <NuxtLink
          class="bottom-nav__link"
          :to="routes.user(session.user.id)"
        >
          <AppIcon
            class="bottom-nav__icon"
            name="user"
          />
          Profile
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
/* Sticky at the end of the layout's flex column: pinned to the viewport while scrolling, yet it keeps its own slot. */
.bottom-nav {
  position: sticky;
  bottom: 0;
  z-index: 10;
  padding-bottom: env(safe-area-inset-bottom);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}

.bottom-nav__list {
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
}

.bottom-nav__item {
  flex: 1;
}

.bottom-nav__link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  min-height: calc(var(--tap-size) + var(--space-4));
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-decoration: none;
}

.bottom-nav__link[aria-current='page'] {
  color: var(--color-text);
}

.bottom-nav__link[aria-current='page'] .bottom-nav__icon {
  color: var(--color-brand-strong);
}

.bottom-nav__link:focus-visible {
  outline-offset: -3px;
}

@media (min-width: 640px) {
  .bottom-nav {
    display: none;
  }
}
</style>
