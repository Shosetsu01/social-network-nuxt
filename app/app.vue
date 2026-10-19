<template>
  <!-- Feedback between a click and the next page: route chunks and blocking page data take a moment. -->
  <NuxtLoadingIndicator
    color="var(--color-brand-strong)"
    error-color="var(--color-danger)"
  />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
