<script setup lang="ts">
import type { Citation } from '#shared/types/citation'
import type { Note } from '#shared/types/note'
import type { CatalogRecord } from '#shared/types/record'

// Concept A right panel, Record tab: the active citation's record, by how it opens (spec 01).
const props = defineProps<{
  record: CatalogRecord
  citation: Citation
  alsoCitedIn: { note: Note, count: number }[]
}>()

const subline = computed(() => {
  const a = props.record.availability
  const parts = a.mode === 'download'
    ? [a.format, formatBytes(a.sizeBytes)]
    : a.mode === 'inline'
      ? [a.format, a.pages ? `${a.pages} pp.` : a.frames ? `${a.frames} frames` : null]
      : [recordTypeLabels[props.record.type]]
  return parts.filter(Boolean).join(' · ')
})

const metadata = computed(() => [
  { term: 'Catalog ID', value: props.record.catalogId, mono: true },
  { term: 'Date', value: props.record.date },
  { term: 'Collection', value: props.record.collection },
])
</script>

<template>
  <div class="flex flex-col gap-5">
    <RecordPanelInline
      v-if="record.availability.mode === 'inline'"
      :record="record"
      :availability="record.availability"
      :locator="citation.locator"
    />

    <header class="flex flex-col gap-1.5">
      <div>
        <RecordAvailabilityBadge :availability="record.availability" />
      </div>
      <h2 class="text-lg/6 font-semibold text-highlighted">
        {{ record.title }}
      </h2>
      <p class="text-sm text-muted">
        {{ subline }} · <span class="font-mono">{{ record.catalogId }}</span>
      </p>
    </header>

    <RecordPanelDownload
      v-if="record.availability.mode === 'download'"
      :record="record"
      :availability="record.availability"
      :locator="citation.locator"
    />
    <RecordPanelExternal
      v-else-if="record.availability.mode === 'external'"
      :record="record"
      :availability="record.availability"
      :citation="citation"
    />
    <RecordPanelPhysical
      v-else-if="record.availability.mode === 'physical'"
      :record="record"
      :availability="record.availability"
      :citation="citation"
    />

    <dl class="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1.5 text-sm">
      <template v-for="row in metadata" :key="row.term">
        <dt class="text-muted">
          {{ row.term }}
        </dt>
        <dd :class="row.mono ? 'font-mono' : undefined">
          {{ row.value }}
        </dd>
      </template>
    </dl>

    <UButton
      :to="`/records/${record.id}`"
      color="neutral"
      variant="outline"
      icon="i-mdi-open-in-new"
      label="Open record"
      class="self-start"
    />

    <section class="flex flex-col gap-2 border-t border-default pt-4">
      <h3 class="text-xs font-medium text-muted">
        Also cited in
      </h3>
      <p v-if="!alsoCitedIn.length" class="text-sm text-muted">
        Not cited in other notes yet.
      </p>
      <ul v-else class="flex flex-col gap-1 text-sm">
        <li v-for="item in alsoCitedIn" :key="item.note.id" class="flex justify-between gap-3">
          <NuxtLink :to="`/p/${item.note.projectId}/notes/${item.note.id}`" class="text-primary underline underline-offset-2">
            {{ item.note.title }}
          </NuxtLink>
          <span class="tabular-nums text-muted">{{ item.count }}×</span>
        </li>
      </ul>
    </section>
  </div>
</template>
