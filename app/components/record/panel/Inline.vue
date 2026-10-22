<script setup lang="ts">
import type { Locator } from '#shared/types/citation'
import type { CatalogRecord, InlineAvailability } from '#shared/types/record'

const props = defineProps<{
  record: CatalogRecord
  availability: InlineAvailability
  locator: Locator
}>()

const page = computed(() => props.locator.kind === 'page' ? props.locator : undefined)
const caption = computed(() => {
  const a = props.availability
  if (page.value)
    return `Page ${page.value.page}${a.pages ? ` of ${a.pages}` : ''}${page.value.region ? ' · cited region' : ''}`
  if (a.frames)
    return `${a.frames} frames · whole record`
  return 'Whole record'
})
</script>

<template>
  <figure class="rounded-lg border border-default bg-(--ui-color-neutral-950) p-4 flex flex-col items-center gap-2">
    <div class="w-3/5">
      <RecordPageStandIn
        :kind="record.type === 'document' ? 'page' : 'image'"
        :page="page?.page"
        :regions="page?.region ? [page.region] : []"
        aria-hidden="true"
      />
    </div>
    <figcaption class="self-start rounded-sm bg-elevated px-1.5 text-xs text-toned">
      {{ caption }}
    </figcaption>
  </figure>
</template>
