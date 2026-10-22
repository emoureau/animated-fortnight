<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { BinFolder } from '#shared/types/bin'
import type { CatalogRecord } from '#shared/types/record'

// One record in the bin list (B1/B2): tile, title, where it is, how it opens, notes and snippets.
const props = defineProps<{
  record: CatalogRecord
  to: string
  selected: boolean
  noteCount: number
  snippetCount: number
  folders: BinFolder[]
  grid?: boolean
}>()

const emit = defineEmits<{ add: [folderId: string] }>()

const meta = computed(() => {
  const a = props.record.availability
  const detail = a.mode === 'inline'
    ? (a.pages ? `${a.pages} pp.` : a.frames ? `${a.frames} frames` : null)
    : null
  const kind = a.mode === 'inline' || a.mode === 'download' ? a.format : recordTypeLabels[props.record.type]
  return [kind, props.record.date, detail].filter(Boolean).join(' · ')
})

/** Second line: catalog ID, or the site / shelf for records that live elsewhere (B2). */
const where = computed(() => {
  const a = props.record.availability
  return a.mode === 'external' ? a.domain : a.mode === 'physical' ? a.location : props.record.catalogId
})

const state = computed(() => {
  const a = props.record.availability
  if (a.mode === 'external' && a.linkStatus === 'broken')
    return { label: 'Link broken', icon: 'i-mdi-alert-outline', color: 'warning' as const }
  if (a.mode === 'external' && a.snapshotAt)
    return { label: `Snapshot ${formatShortDate(a.snapshotAt)}`, color: 'neutral' as const }
  if (a.mode === 'physical' && a.retrieval)
    return { label: `Retrieval ${a.retrieval.status}`, color: 'neutral' as const }
  return null
})

const counts = computed(() => {
  const parts = [
    props.noteCount ? `${props.noteCount} ${props.noteCount === 1 ? 'note' : 'notes'}` : null,
    props.snippetCount ? `${props.snippetCount} ${props.snippetCount === 1 ? 'snippet' : 'snippets'}` : null,
  ].filter(Boolean)
  return parts.length ? parts.join(' · ') : 'No notes yet'
})

// Keyboard and single-pointer alternative to dragging (WCAG 2.2, 2.5.7).
const menu = computed<DropdownMenuItem[]>(() => [{
  label: 'Add to folder',
  icon: 'i-mdi-folder-plus-outline',
  children: props.folders.map(folder => ({
    label: folder.name,
    icon: folder.recordIds.includes(props.record.id) ? 'i-mdi-check' : 'i-mdi-folder-outline',
    disabled: folder.recordIds.includes(props.record.id),
    onSelect: () => emit('add', folder.id),
  })),
}])

function onDragStart(event: DragEvent) {
  event.dataTransfer?.setData(RECORD_DRAG_TYPE, props.record.id)
  event.dataTransfer?.setData('text/plain', props.record.title)
  if (event.dataTransfer)
    event.dataTransfer.effectAllowed = 'copy'
}
</script>

<template>
  <li
    draggable="true"
    class="group relative flex gap-3 rounded-lg border p-3"
    :class="[
      selected ? 'border-primary bg-elevated' : 'border-transparent hover:bg-elevated',
      grid ? 'flex-col' : '',
    ]"
    @dragstart="onDragStart"
  >
    <RecordTypeTile :record="record" />
    <div class="flex min-w-0 flex-1 flex-col gap-1.5">
      <NuxtLink
        :to="to"
        :aria-current="selected ? 'true' : undefined"
        class="pe-7 font-medium text-highlighted after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-primary"
      >
        {{ record.title }}
      </NuxtLink>
      <p class="text-xs text-toned">
        {{ meta }}
      </p>
      <p class="text-xs text-muted" :class="record.availability.mode === 'physical' ? '' : 'font-mono'">
        {{ where }}
      </p>
      <div class="flex flex-wrap gap-1.5">
        <RecordAvailabilityBadge :availability="record.availability" />
        <UBadge
          v-if="state"
          :color="state.color"
          :variant="state.color === 'warning' ? 'subtle' : 'outline'"
          :icon="state.icon"
          :label="state.label"
        />
        <UBadge color="neutral" variant="outline" :label="counts" />
      </div>
    </div>
    <UDropdownMenu :items="menu" :content="{ align: 'end' }">
      <UButton
        color="neutral"
        variant="ghost"
        size="xs"
        icon="i-mdi-dots-horizontal"
        :aria-label="`More for ${record.title}`"
        class="absolute top-2 right-2 z-10"
      />
    </UDropdownMenu>
  </li>
</template>
