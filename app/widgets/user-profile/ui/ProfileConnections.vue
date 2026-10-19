<script setup lang="ts">
import { UserLink, type UserSummary } from '@entities/user'

interface Props {
  connections: UserSummary[]
}

defineProps<Props>()
</script>

<template>
  <ul
    class="profile-connections"
    aria-label="Connections"
  >
    <li
      v-for="connection in connections"
      :key="connection.id"
    >
      <UserLink :user="connection" />
    </li>
  </ul>
</template>

<style scoped>
.profile-connections {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
  gap: var(--space-2) var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
