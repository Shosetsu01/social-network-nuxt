<script setup lang="ts">
import { useSessionStore } from '@entities/session'
import { routes } from '@shared/config'
import { AppAvatar, AppIcon } from '@shared/ui'

const session = useSessionStore()
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <NuxtLink
        class="app-header__brand"
        :to="routes.home"
      >
        <span
          class="app-header__logo"
          aria-hidden="true"
        />
        Socio Network
      </NuxtLink>

      <!-- Desktop navigation; below 640px the bottom bar takes over (CSS only, no width detection). -->
      <nav
        class="app-header__nav"
        aria-label="Main"
      >
        <!-- RouterLink sets aria-current="page" on the exact-active link. -->
        <NuxtLink
          class="app-header__link"
          :to="routes.home"
        >
          <AppIcon
            name="home"
            :size="20"
          />
          Home
        </NuxtLink>
        <NuxtLink
          v-if="session.user"
          class="app-header__link"
          :to="routes.user(session.user.id)"
        >
          <AppIcon
            name="user"
            :size="20"
          />
          Profile
        </NuxtLink>
      </nav>

      <!-- Decorative: the current user's name is not needed to operate the page, and Profile is in the nav. -->
      <AppAvatar
        v-if="session.user"
        :src="session.user.avatarUrl"
        :name="session.user.name"
        :size="36"
        is-eager
      />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  /* Insets are 0 unless the viewport uses viewport-fit=cover. */
  padding-top: env(safe-area-inset-top);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.app-header__inner {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  max-width: var(--content-max-width);
  margin-inline: auto;
  padding-block: var(--space-2);
  padding-right: max(var(--space-4), env(safe-area-inset-right));
  padding-left: max(var(--space-4), env(safe-area-inset-left));
}

.app-header__brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--tap-size);
  margin-inline-end: auto;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-black);
  text-decoration: none;
}

.app-header__logo {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-sm);
  background: var(--color-brand);
}

.app-header__nav {
  display: none;
}

.app-header__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--tap-size);
  padding: 0 var(--space-4);
  border-radius: var(--radius-full);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-bold);
  text-decoration: none;
  transition: background-color var(--duration-fast) ease, color var(--duration-fast) ease;
}

.app-header__link:hover {
  background: var(--color-placeholder);
  color: var(--color-text);
}

.app-header__link[aria-current='page'] {
  background: var(--color-brand);
  color: var(--color-on-brand);
}

@media (min-width: 640px) {
  .app-header__nav {
    display: flex;
    gap: var(--space-2);
  }
}
</style>
