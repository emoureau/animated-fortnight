<script setup lang="ts">
import type { RecordNote } from '#shared/types/bin'
import type { Citation, Snippet } from '#shared/types/citation'
import type { CatalogRecord, DownloadAvailability } from '#shared/types/record'

// Download-only record (spec 02, B2): can't-be-shown panel, files inside, description, team snippets.
const props = defineProps<{
  record: CatalogRecord
  availability: DownloadAvailability
  notes: RecordNote[]
  snippets: Snippet[]
}>()

const emit = defineEmits<{ snippetAdded: [] }>()

const toast = useToast()
const { byId } = useUsers()
const { data: citations } = useFetch<Citation[]>('/api/citations', { key: 'citations', default: () => [] })

const fileCount = computed(() => props.availability.manifestTotalFiles ?? props.availability.manifest?.length)
const summary = computed(() =>
  `${[props.availability.format, formatBytes(props.availability.sizeBytes), fileCount.value ? `${fileCount.value} files` : null].filter(Boolean).join(' · ')}.`)
const moreFiles = computed(() => (props.availability.manifestTotalFiles ?? 0) - (props.availability.manifest?.length ?? 0))

/** Notes and citations that point at a file in the manifest. */
function citedCount(path: string) {
  const inNotes = props.notes.filter(n => n.locator.kind === 'file' && n.locator.file === path).length
  const inCitations = citations.value.filter(c => c.recordId === props.record.id && c.locator.kind === 'file' && c.locator.file === path).length
  return inNotes + inCitations
}

// The mock catalog has no network paths, so this one is made up from the catalog ID.
const networkPath = computed(() => `\\\\catalog\\records\\${props.record.catalogId}`)

async function copyPath() {
  await navigator.clipboard.writeText(networkPath.value)
  toast.add({ title: 'Network path copied', description: networkPath.value, icon: 'i-mdi-check-circle-outline', color: 'success' })
}

function download() {
  toast.add({ title: 'No file in the prototype', description: 'Downloads aren’t wired to a real catalog.', icon: 'i-mdi-information-outline', color: 'info' })
}

const pasting = ref(false)
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <section class="flex flex-col gap-4 rounded-lg border border-default bg-elevated p-4">
      <div class="flex items-start gap-4">
        <RecordTypeTile :record="record" />
        <div class="flex flex-col gap-1 text-sm">
          <h3 class="font-semibold text-highlighted">
            This record can’t be shown in the browser
          </h3>
          <p class="text-toned">
            {{ summary }} Open it in your own tools, then cite a file and line below.
          </p>
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton icon="i-mdi-download-outline" label="Download" @click="download" />
        <UButton
          color="neutral"
          variant="outline"
          label="Copy network path"
          @click="copyPath"
        />
      </div>
    </section>

    <div class="grid gap-4 xl:grid-cols-2">
      <section v-if="availability.manifest" class="flex flex-col gap-2 rounded-lg border border-default bg-elevated p-4" aria-labelledby="files-inside">
        <h3 id="files-inside" class="text-sm">
          <span class="font-semibold text-highlighted">Files inside</span> <span class="text-muted">from the catalog manifest</span>
        </h3>
        <ul class="flex flex-col gap-1 font-mono text-sm">
          <li
            v-for="file in availability.manifest"
            :key="file.path"
            class="flex justify-between gap-3 rounded-md px-2 py-1"
            :class="citedCount(file.path) ? 'bg-accented' : ''"
          >
            <span class="min-w-0 break-words">
              {{ file.path }}<span v-if="citedCount(file.path)" class="text-toned"> · cited {{ citedCount(file.path) }}×</span>
            </span>
            <span class="shrink-0 text-muted" :class="citedCount(file.path) ? 'text-toned' : ''">{{ formatBytes(file.sizeBytes) }}</span>
          </li>
        </ul>
        <p v-if="moreFiles > 0" class="px-2 font-mono text-xs text-muted">
          + {{ moreFiles }} more files
        </p>
      </section>

      <BinRecordDescription
        :record="record"
        :facts="[{ term: 'Format', value: availability.format }, { term: 'Opens in', value: availability.opensIn }]"
      />
    </div>

    <section class="flex flex-col gap-3 rounded-lg border border-default bg-elevated p-4" aria-labelledby="team-snippets">
      <div class="flex items-center gap-2">
        <h3 id="team-snippets" class="flex-1 font-semibold text-highlighted">
          Team snippets
        </h3>
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-mdi-crop"
          label="Paste screenshot or text"
          @click="pasting = true"
        />
      </div>
      <p v-if="!snippets.length" class="flex items-center gap-1.5 text-sm text-warning">
        <UIcon name="i-mdi-alert-outline" class="size-4" aria-hidden="true" />
        No snippet yet: readers can’t see anything of this record.
      </p>
      <div v-else class="grid gap-3 sm:grid-cols-2">
        <SnippetCard
          v-for="snippet in snippets"
          :key="snippet.id"
          :snippet="snippet"
          :author="byId.get(snippet.createdBy)"
        />
      </div>
      <p class="text-xs text-muted">
        Snippets are made by your team, not the catalog. Each one keeps the file it came from.
      </p>
    </section>

    <BinRecordSnippetPasteModal
      v-model:open="pasting"
      :record="record"
      :files="availability.manifest?.map(f => f.path) ?? []"
      @saved="emit('snippetAdded')"
    />
  </div>
</template>
