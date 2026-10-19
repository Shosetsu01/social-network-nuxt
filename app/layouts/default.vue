<script setup lang="ts">
import { AppHeader } from '@widgets/app-header'
import { BottomNav } from '@widgets/bottom-nav'
</script>

<template>
  <div class="default-layout">
    <AppHeader />
    <main class="default-layout__main">
      <slot />
    </main>
    <BottomNav />
  </div>
</template>

<style scoped>
/*
 * A flex column at least one viewport tall: the sticky bottom bar keeps its own slot after `main`,
 * so the end of the content is never covered and no padding has to mirror the bar's height.
 */
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}

/* Content width and gutters belong to pages and widgets. */
.default-layout__main {
  flex: 1;
  width: 100%;
}
</style>
