<script setup lang="ts">
import type { BinFolder } from '#shared/types/bin'
import type { CatalogRecord } from '#shared/types/record'

// Column 2 (spec 02): folder name, filter, list or grid view, record rows.
const props = defineProps<{
  title: string
  records: CatalogRecord[]
  selectedId?: string
  linkFor: (recordId: string) => string
  noteCount: Map<string, number>
  snippetCount: Map<string, number>
  folders: BinFolder[]
  /** Shown when a "How records open" filter is on */
  filterLabel?: string
}>()

const emit = defineEmits<{ add: [folderId: string, recordId: string], clearFilter: [] }>()

const view = ref<'list' | 'grid'>('list')
const searching = ref(false)
const query = ref('')
const searchInput = useTemplateRef('searchInput')

async function toggleSearch() {
  searching.value = !searching.value
  query.value = ''
  if (searching.value) {
    await nextTick()
    searchInput.value?.inputRef?.focus()
  }
}

const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? props.records.filter(r => r.title.toLowerCase().includes(q) || r.catalogId.toLowerCase().includes(q)) : props.records
})
</script>

<template>
  <section class="flex flex-col gap-3" :aria-label="`Records in ${title}`">
    <header class="flex items-center gap-1">
      <h2 class="flex-1 text-base font-semibold text-highlighted">
        {{ title }}
      </h2>
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-mdi-filter-outline"
        aria-label="Filter records by title or catalog ID"
        :aria-pressed="searching"
        @click="toggleSearch"
      />
      <UFieldGroup>
        <UButton
          color="neutral"
          :variant="view === 'list' ? 'subtle' : 'ghost'"
          icon="i-mdi-view-list-outline"
          aria-label="List view"
          :aria-pressed="view === 'list'"
          @click="view = 'list'"
        />
        <UButton
          color="neutral"
          :variant="view === 'grid' ? 'subtle' : 'ghost'"
          icon="i-mdi-view-grid-outline"
          aria-label="Grid view"
          :aria-pressed="view === 'grid'"
          @click="view = 'grid'"
        />
      </UFieldGroup>
    </header>

    <UInput
      v-if="searching"
      ref="searchInput"
      v-model="query"
      icon="i-mdi-magnify"
      placeholder="Title or catalog ID"
      aria-label="Filter records by title or catalog ID"
      @keydown.esc="toggleSearch"
    />

    <p v-if="filterLabel" class="flex items-center gap-2 text-xs text-muted">
      Showing {{ filterLabel }}
      <UButton
        size="xs"
        color="neutral"
        variant="link"
        label="Show all"
        @click="emit('clearFilter')"
      />
    </p>

    <p v-if="!shown.length" class="py-6 text-center text-sm text-muted">
      No records here{{ filterLabel || query ? ' match' : ' yet. Add some from the catalog' }}.
    </p>
    <ul v-else :class="view === 'grid' ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-1'">
      <BinRecordRow
        v-for="record in shown"
        :key="record.id"
        :record="record"
        :to="linkFor(record.id)"
        :selected="record.id === selectedId"
        :note-count="noteCount.get(record.id) ?? 0"
        :snippet-count="snippetCount.get(record.id) ?? 0"
        :folders="folders"
        :grid="view === 'grid'"
        @add="emit('add', $event, record.id)"
      />
    </ul>
  </section>
</template>
