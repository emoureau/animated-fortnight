<script setup lang="ts">
import type { RecordNote } from '#shared/types/bin'
import type { Snippet } from '#shared/types/citation'
import type { CatalogRecord } from '#shared/types/record'

// Column 3 of the bin: the selected record, by how it opens (spec 02).
defineProps<{
  record: CatalogRecord
  notes: RecordNote[]
  snippets: Snippet[]
}>()

const emit = defineEmits<{ noteFromSelection: [], snippetAdded: [] }>()
</script>

<template>
  <div class="flex min-h-full flex-col">
    <BinRecordHeader :record="record" />
    <BinRecordInlineView
      v-if="record.availability.mode === 'inline'"
      :record="record"
      :availability="record.availability"
      :notes="notes"
      class="flex-1"
      @note-from-selection="emit('noteFromSelection')"
    />
    <BinRecordDownloadView
      v-else-if="record.availability.mode === 'download'"
      :record="record"
      :availability="record.availability"
      :notes="notes"
      :snippets="snippets"
      @snippet-added="emit('snippetAdded')"
    />
    <BinRecordExternalView v-else-if="record.availability.mode === 'external'" :record="record" :availability="record.availability" />
    <BinRecordPhysicalView v-else :record="record" :availability="record.availability" />
  </div>
</template>
