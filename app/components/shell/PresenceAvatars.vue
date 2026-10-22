<script setup lang="ts">
import type { User } from '#shared/types/user'

// Project members currently present (faked: everyone in the project).
const props = defineProps<{
  people: User[]
}>()

const label = computed(() => `${props.people.length} ${props.people.length === 1 ? 'person' : 'people'} here: ${props.people.map(p => p.isCurrentUser ? 'you' : p.name).join(', ')}`)
</script>

<template>
  <div role="group" :aria-label="label">
    <UAvatarGroup size="md">
      <PersonAvatar
        v-for="person in people"
        :key="person.id"
        :user="person"
        you-label
      />
    </UAvatarGroup>
  </div>
</template>
