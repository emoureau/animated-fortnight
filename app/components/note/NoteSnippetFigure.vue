<script setup lang="ts">
import type { Snippet } from '#shared/types/citation'
import type { User } from '#shared/types/user'

// A team snippet embedded in a note (A2). Always labelled as team-made, with its source.
defineProps<{
  snippet: Snippet
  author?: User
}>()
</script>

<template>
  <figure class="my-6 rounded-lg border border-default bg-elevated overflow-hidden">
    <div class="relative bg-accented">
      <UBadge
        color="neutral"
        variant="solid"
        size="sm"
        :icon="snippet.kind === 'image' ? 'i-mdi-crop' : 'i-mdi-text-box-outline'"
        :label="snippet.kind === 'image' ? 'Snippet · screenshot' : 'Snippet · text excerpt'"
        class="absolute top-2 left-2"
      />
      <img
        v-if="snippet.kind === 'image' && snippet.imagePath"
        :src="snippet.imagePath"
        :alt="snippet.caption"
        class="w-full max-h-72 object-cover"
      >
      <blockquote v-else class="px-4 pt-12 pb-4 font-mono text-sm text-toned whitespace-pre-wrap">
        {{ snippet.text }}
      </blockquote>
    </div>
    <figcaption class="flex items-start gap-4 px-3 py-2.5 text-sm">
      <!-- div, not p: inside the editor, p takes the 30px body line height -->
      <div class="flex-1 text-toned leading-5">
        <span class="text-default">{{ snippet.caption }}.</span>
        Added by {{ author?.name ?? 'a team member' }} · {{ formatShortDate(snippet.createdAt) }} · not part of the catalog record
        <template v-if="snippet.sourceFile">
          · from <span class="font-mono">{{ snippet.sourceFile }}</span>
        </template>
      </div>
      <NuxtLink :to="`/records/${snippet.recordId}`" class="shrink-0 text-primary underline underline-offset-2">
        Source record
      </NuxtLink>
    </figcaption>
  </figure>
</template>
