<template>
  <div class="auth-layout">
    <main class="auth-layout__main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.auth-layout {
  display: grid;
  place-items: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: var(--space-4);
  font-family: var(--font-display);
}

.auth-layout__main {
  width: 100%;
  max-width: 26rem;
  padding: var(--space-6) var(--space-5);
  border-top: 4px solid var(--color-brand);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
}
</style>
