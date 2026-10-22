<script setup lang="ts">
import type { CatalogRecord } from '#shared/types/record'

// Record view header (B1/B2). "Added by" isn't in the mock data, so it's left out.
defineProps<{ record: CatalogRecord }>()
</script>

<template>
  <header class="flex items-start gap-3 border-b border-default px-4 py-3">
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <h2 class="text-lg/6 font-semibold text-highlighted">
        {{ record.title }}
      </h2>
      <p class="text-xs text-muted">
        {{ record.creator }} · {{ record.date }} · <span class="font-mono">{{ record.catalogId }}</span>
      </p>
    </div>
    <UButton
      :to="`/records/${record.id}`"
      color="neutral"
      variant="outline"
      icon="i-mdi-open-in-new"
      label="Catalog record"
    />
  </header>
</template>
