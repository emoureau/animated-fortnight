<script setup lang="ts">
import type { CatalogRecord } from '#shared/types/record'

// "Catalog description" block (B2), with whatever facts the catalog has for this record.
defineProps<{
  record: CatalogRecord
  facts?: { term: string, value: string }[]
}>()
</script>

<template>
  <section class="flex flex-col gap-3 rounded-lg border border-default bg-elevated p-4" aria-labelledby="catalog-description">
    <h3 id="catalog-description" class="font-semibold text-highlighted">
      Catalog description
    </h3>
    <p class="text-sm text-toned">
      {{ record.description }}
    </p>
    <dl v-if="facts?.length" class="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1.5 text-sm">
      <template v-for="fact in facts" :key="fact.term">
        <dt class="text-muted">
          {{ fact.term }}
        </dt>
        <dd>{{ fact.value }}</dd>
      </template>
    </dl>
  </section>
</template>
