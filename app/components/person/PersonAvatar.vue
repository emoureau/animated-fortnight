<script setup lang="ts">
import type { User } from '#shared/types/user'

const props = withDefaults(defineProps<{
  user: User
  size?: '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg'
  /** Show "You" instead of initials for the current user, as in the app bar */
  youLabel?: boolean
}>(), { size: 'sm', youLabel: false })

const text = computed(() => props.youLabel && props.user.isCurrentUser ? 'You' : props.user.initials)
const name = computed(() => props.user.isCurrentUser ? `${props.user.name} (you)` : props.user.name)
</script>

<template>
  <UAvatar
    :text="text"
    :size="size"
    role="img"
    :aria-label="name"
    :title="name"
    :ui="{ root: personClasses[user.dataColor].fill, fallback: 'text-data-label font-semibold text-xs' }"
  />
</template>
