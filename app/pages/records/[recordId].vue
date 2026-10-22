<script setup lang="ts">
import type { Snippet } from '#shared/types/citation'
import type { CatalogRecord } from '#shared/types/record'

// Full catalog record page, reached from search and "Catalog record" buttons (spec 00).
const route = useRoute('records-recordId')
const { data: record } = await useFetch<CatalogRecord>(() => `/api/records/${route.params.recordId}`)
const { data: snippets } = await useFetch<Snippet[]>(() => `/api/records/${route.params.recordId}/snippets`, { default: () => [] })
const { byId } = useUsers()

useHead({ title: () => record.value?.title ?? 'Catalog record' })

const metadata = computed(() => record.value
  ? [
      { term: 'Catalog ID', value: record.value.catalogId, mono: true },
      { term: 'Type', value: recordTypeLabels[record.value.type] },
      { term: 'Date', value: record.value.date },
      { term: 'Creator', value: record.value.creator },
      { term: 'Collection', value: record.value.collection },
    ]
  : [])
</script>

<template>
  <article v-if="record" class="mx-auto max-w-3xl px-4 py-10 flex flex-col gap-8">
    <header class="flex items-start gap-4">
      <RecordTypeTile :record="record" />
      <div class="flex flex-col gap-2 min-w-0">
        <span class="flex items-center gap-1.5 text-sm text-secondary">
          <UIcon :name="recordTypeIcons[record.type]" class="size-4" aria-hidden="true" />
          {{ recordTypeLabels[record.type] }}
        </span>
        <h1 class="text-3xl font-semibold text-highlighted">
          {{ record.title }}
        </h1>
        <p class="text-sm text-muted">
          {{ record.creator }} · {{ record.date }} · <span class="font-mono">{{ record.catalogId }}</span>
        </p>
        <div>
          <RecordAvailabilityBadge :availability="record.availability" size="md" />
        </div>
      </div>
    </header>

    <section aria-labelledby="opens-heading" class="flex flex-col gap-3 rounded-lg border border-default bg-elevated p-4">
      <h2 id="opens-heading" class="text-lg font-semibold text-highlighted">
        How it opens
      </h2>

      <template v-if="record.availability.mode === 'inline'">
        <p>
          Opens in the browser. {{ record.availability.format }}<template v-if="record.availability.pages">
            · {{ record.availability.pages }} pages
          </template><template v-if="record.availability.frames">
            · {{ record.availability.frames }} frames
          </template><template v-if="record.availability.hasOcr">
            · searchable text
          </template>
        </p>
      </template>

      <template v-else-if="record.availability.mode === 'download'">
        <p>
          This record can’t be shown in the browser. {{ record.availability.format }} · {{ formatBytes(record.availability.sizeBytes) }} · opens in {{ record.availability.opensIn }}.
        </p>
        <div v-if="record.availability.manifest" class="flex flex-col gap-2">
          <h3 class="text-sm font-medium text-toned">
            Files inside
          </h3>
          <ul class="flex flex-col divide-y divide-default text-sm">
            <li v-for="file in record.availability.manifest" :key="file.path" class="flex justify-between gap-4 py-1.5">
              <span class="font-mono truncate">{{ file.path }}</span>
              <span class="text-muted tabular-nums shrink-0">{{ formatBytes(file.sizeBytes) }}</span>
            </li>
          </ul>
          <p v-if="record.availability.manifestTotalFiles && record.availability.manifestTotalFiles > record.availability.manifest.length" class="text-xs text-muted">
            Showing {{ record.availability.manifest.length }} of {{ record.availability.manifestTotalFiles }} files.
          </p>
        </div>
      </template>

      <template v-else-if="record.availability.mode === 'external'">
        <p>
          Lives on an external site: <span class="font-mono">{{ record.availability.domain }}</span>
        </p>
        <p v-if="record.availability.linkStatus === 'broken'" class="flex items-center gap-1.5 text-warning">
          <UIcon name="i-mdi-alert-outline" class="size-5" aria-hidden="true" />
          Link broken<template v-if="record.availability.brokenSince">
            since {{ formatDate(record.availability.brokenSince) }}
          </template>
        </p>
        <p v-else class="flex items-center gap-1.5 text-success">
          <UIcon name="i-mdi-check-circle-outline" class="size-5" aria-hidden="true" />
          Link working · checked {{ formatDate(record.availability.linkCheckedAt) }}
        </p>
        <p class="text-sm text-muted">
          {{ record.availability.snapshotAt ? `Snapshot saved ${formatDate(record.availability.snapshotAt)}` : 'No snapshot saved yet' }}
        </p>
      </template>

      <template v-else-if="record.availability.mode === 'physical'">
        <p>Physical item at {{ record.availability.location }}.</p>
        <p v-if="record.availability.retrieval" class="text-sm text-toned">
          Retrieval {{ record.availability.retrieval.status }} by {{ byId.get(record.availability.retrieval.requestedBy)?.name ?? 'a team member' }} · {{ formatDate(record.availability.retrieval.requestedAt) }}
        </p>
        <p v-else class="text-sm text-muted">
          No retrieval requested.
        </p>
      </template>
    </section>

    <section aria-labelledby="description-heading" class="flex flex-col gap-3">
      <h2 id="description-heading" class="text-lg font-semibold text-highlighted">
        Catalog description
      </h2>
      <p class="max-w-[70ch]">
        {{ record.description }}
      </p>
      <ul class="flex flex-wrap gap-1.5" aria-label="Keywords">
        <li v-for="keyword in record.keywords" :key="keyword">
          <UBadge
            color="neutral"
            variant="soft"
            :label="keyword"
            class="rounded-full"
          />
        </li>
      </ul>
    </section>

    <section aria-labelledby="metadata-heading" class="flex flex-col gap-3">
      <h2 id="metadata-heading" class="text-lg font-semibold text-highlighted">
        Details
      </h2>
      <dl class="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
        <template v-for="row in metadata" :key="row.term">
          <dt class="text-muted">
            {{ row.term }}
          </dt>
          <dd :class="row.mono ? 'font-mono' : undefined">
            {{ row.value }}
          </dd>
        </template>
      </dl>
    </section>

    <section v-if="snippets.length" aria-labelledby="snippets-heading" class="flex flex-col gap-3">
      <h2 id="snippets-heading" class="text-lg font-semibold text-highlighted">
        Team snippets
      </h2>
      <div class="grid gap-3 sm:grid-cols-2">
        <SnippetCard
          v-for="snippet in snippets"
          :key="snippet.id"
          :snippet="snippet"
          :author="byId.get(snippet.createdBy)"
        />
      </div>
    </section>
  </article>
</template>
