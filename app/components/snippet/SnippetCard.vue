<script setup lang="ts">
import type { Snippet } from '#shared/types/citation'
import type { User } from '#shared/types/user'

// A team-made stand-in for a record that can't be viewed. Always labelled as such.
defineProps<{
  snippet: Snippet
  author?: User
}>()
</script>

<template>
  <figure class="rounded-lg border border-default bg-elevated overflow-hidden">
    <img
      v-if="snippet.kind === 'image' && snippet.imagePath"
      :src="snippet.imagePath"
      :alt="snippet.caption"
      class="w-full bg-(--ui-color-neutral-950) object-contain max-h-64"
    >
    <blockquote v-else-if="snippet.text" class="m-3 border-l-2 border-accented pl-3 font-mono text-xs text-toned whitespace-pre-wrap">
      {{ snippet.text }}
    </blockquote>
    <figcaption class="p-3 flex flex-col gap-1 text-xs text-muted">
      <span class="text-sm text-default">{{ snippet.caption }}</span>
      <span class="flex items-center gap-1.5">
        <UIcon name="i-mdi-content-cut" class="size-4 shrink-0" aria-hidden="true" />
        Snippet · not part of the catalog record
      </span>
      <span class="flex flex-wrap items-center gap-x-1.5">
        <template v-if="author">
          <PersonAvatar :user="author" size="2xs" />
          <span>{{ author.name }}</span>
          <span aria-hidden="true">·</span>
        </template>
        <span>from <span class="font-mono">{{ snippet.sourceFile ?? 'unknown file' }}</span></span>
      </span>
    </figcaption>
  </figure>
</template>
