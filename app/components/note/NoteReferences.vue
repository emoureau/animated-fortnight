<script setup lang="ts">
import type { Citation } from '#shared/types/citation'
import type { CatalogRecord } from '#shared/types/record'

// Generated from the citations in order of first appearance (spec 01).
const props = defineProps<{
  cited: { citation: Citation, record: CatalogRecord }[]
}>()

const styles = ['Chicago author-date']
const style = ref(styles[0])

const entries = computed(() => props.cited.map(({ citation, record }) => {
  const ref = chicagoReference(record, citation.locator)
  return {
    id: citation.id,
    lead: `${ref.creator}. ${ref.date}. `,
    title: ref.title,
    tail: ref.locator ? `, ${ref.locator}. ` : '. ',
    catalogId: ref.catalogId,
  }
}))
</script>

<template>
  <section aria-labelledby="references-heading" class="mt-12 pt-6 border-t border-default flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
      <h2 id="references-heading" class="text-lg font-semibold text-highlighted">
        References
      </h2>
      <span class="text-sm text-muted">Built from citations · updates as you write</span>
      <USelect
        v-model="style"
        :items="styles"
        aria-label="Citation style"
        class="ms-auto w-52"
      />
    </div>
    <p v-if="!entries.length" class="text-muted">
      No citations yet.
    </p>
    <ol v-else class="list-decimal ps-6 flex flex-col gap-2 text-base text-default marker:text-muted">
      <!-- Pieces via v-text so template whitespace can't land before the punctuation -->
      <li v-for="entry in entries" :key="entry.id">
        <span v-text="entry.lead" />
        <cite v-text="entry.title" />
        <span v-text="entry.tail" />
        <span class="font-mono text-sm text-muted" v-text="entry.catalogId" />
      </li>
    </ol>
  </section>
</template>
