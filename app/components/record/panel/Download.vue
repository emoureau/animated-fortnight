<script setup lang="ts">
import type { Locator, Snippet } from '#shared/types/citation'
import type { CatalogRecord, DownloadAvailability } from '#shared/types/record'

const props = defineProps<{
  record: CatalogRecord
  availability: DownloadAvailability
  locator: Locator
}>()

const toast = useToast()
const { byId } = useUsers()
const { data: snippets } = useFetch<Snippet[]>(() => `/api/records/${props.record.id}/snippets`, { default: () => [] })

// The mock catalog has no network paths, so this one is made up from the catalog ID.
const filePath = computed(() => `\\\\catalog\\records\\${props.record.catalogId}`)

async function copyPath() {
  await navigator.clipboard.writeText(filePath.value)
  toast.add({ title: 'File path copied', description: filePath.value, icon: 'i-mdi-check-circle-outline', color: 'success' })
}

function download() {
  toast.add({ title: 'No file in the prototype', description: 'Downloads aren’t wired to a real catalog.', icon: 'i-mdi-information-outline', color: 'info' })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-3 rounded-lg border border-default bg-default p-3">
      <RecordTypeTile :record="record" />
      <p class="text-sm text-toned">
        Can’t be shown in the browser. Open it in {{ availability.opensIn }}, or use the team’s snippets below.
      </p>
    </div>
    <div class="grid grid-cols-2 gap-2">
      <UButton
        icon="i-mdi-download-outline"
        label="Download"
        block
        @click="download"
      />
      <UButton
        color="neutral"
        variant="outline"
        label="Copy file path"
        block
        @click="copyPath"
      />
    </div>

    <RecordPanelCitedAt :locator="locator" />

    <section v-if="availability.manifest" class="flex flex-col gap-1.5">
      <h3 class="text-xs font-medium text-muted">
        What’s inside (from the catalog)
      </h3>
      <ul class="flex flex-col gap-1 text-sm">
        <li v-for="file in availability.manifest" :key="file.path" class="flex justify-between gap-3">
          <span class="font-mono truncate">{{ file.path }}</span>
          <span class="font-mono text-muted shrink-0">{{ formatBytes(file.sizeBytes) }}</span>
        </li>
      </ul>
      <p v-if="availability.manifestTotalFiles && availability.manifestTotalFiles > availability.manifest.length" class="text-xs text-muted">
        Showing {{ availability.manifest.length }} of {{ availability.manifestTotalFiles }} files.
      </p>
    </section>

    <section class="flex flex-col gap-2 border-t border-default pt-4">
      <h3 class="text-xs font-medium text-muted">
        Team snippets · {{ snippets.length }}
      </h3>
      <p v-if="!snippets.length" class="flex items-center gap-1.5 text-sm text-warning">
        <UIcon name="i-mdi-alert-outline" class="size-4" aria-hidden="true" />
        No snippet yet: readers can’t see anything of this record.
      </p>
      <SnippetCard
        v-for="snippet in snippets"
        :key="snippet.id"
        :snippet="snippet"
        :author="byId.get(snippet.createdBy)"
      />
    </section>
  </div>
</template>
