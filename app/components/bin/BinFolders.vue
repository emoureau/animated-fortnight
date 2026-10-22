<script setup lang="ts">
import type { BinFilter, BinFolderNode } from '~/composables/useBin'

// Column 1 (spec 02): Add from catalog, folders with counts, New folder, How records open, drop zone.
const props = defineProps<{
  projectId: string
  tree: BinFolderNode[]
  currentFolderId: string
  allCount: number
  counts: Record<BinFilter, number>
}>()

const emit = defineEmits<{
  drop: [folderId: string, recordId: string]
  create: [name: string]
}>()

const filter = defineModel<BinFilter | null>('filter', { default: null })

const { show: showSearch } = useOmniSearch()

const dragOver = ref<string | null>(null)

function onDragOver(event: DragEvent, folderId: string) {
  if (!event.dataTransfer?.types.includes(RECORD_DRAG_TYPE))
    return
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
  dragOver.value = folderId
}

function onDrop(event: DragEvent, folderId: string) {
  const recordId = event.dataTransfer?.getData(RECORD_DRAG_TYPE)
  dragOver.value = null
  if (recordId)
    emit('drop', folderId, recordId)
}

// The drop zone adds to the folder you're in; on All records, to Unsorted.
const dropZoneTarget = computed(() => {
  if (props.currentFolderId !== 'all')
    return props.currentFolderId
  const folders = props.tree.flatMap(n => [n.folder, ...n.children])
  return (folders.find(f => f.name === 'Unsorted') ?? folders.at(-1))?.id ?? null
})

// New folder
const naming = ref(false)
const newName = ref('')
const nameInput = useTemplateRef('nameInput')

async function startNaming() {
  naming.value = true
  await nextTick()
  nameInput.value?.inputRef?.focus()
}

function createFolder() {
  if (newName.value.trim())
    emit('create', newName.value.trim())
  newName.value = ''
  naming.value = false
}

const filters = [
  { id: 'inline', label: 'Opens here', icon: availabilityIcons.inline },
  { id: 'download', label: 'Download only', icon: availabilityIcons.download },
  { id: 'external', label: 'External site', icon: availabilityIcons.external },
  { id: 'physical', label: 'Physical item', icon: availabilityIcons.physical },
  { id: 'no-snippet', label: 'No snippet yet', icon: 'i-mdi-crop' },
] as const

const folderLink = (id: string) => `/p/${props.projectId}/bin/${id}`
</script>

<template>
  <div class="flex h-full flex-col gap-5">
    <UButton
      icon="i-mdi-plus"
      label="Add from catalog"
      block
      @click="showSearch('add-to-bin')"
    />

    <nav aria-label="Bin folders" class="flex flex-col gap-0.5 text-sm">
      <NuxtLink
        :to="folderLink('all')"
        :aria-current="currentFolderId === 'all' ? 'page' : undefined"
        class="flex items-center gap-2 rounded-md px-2 py-1.5"
        :class="currentFolderId === 'all' ? 'bg-accented font-semibold text-highlighted' : 'text-toned hover:bg-elevated'"
      >
        <UIcon name="i-mdi-tray-full" class="size-5 shrink-0" aria-hidden="true" />
        <span class="flex-1">All records</span>
        <span class="tabular-nums text-toned">{{ allCount }}</span>
      </NuxtLink>

      <template v-for="node in tree" :key="node.folder.id">
        <NuxtLink
          v-for="(folder, i) in [node.folder, ...node.children]"
          :key="folder.id"
          :to="folderLink(folder.id)"
          :aria-current="currentFolderId === folder.id ? 'page' : undefined"
          class="flex items-center gap-2 rounded-md py-1.5 pe-2 outline-offset-[-2px]"
          :class="[
            i === 0 ? 'ps-2' : 'ps-9',
            currentFolderId === folder.id ? 'bg-accented font-semibold text-highlighted' : 'text-toned hover:bg-elevated',
            dragOver === folder.id ? 'outline-2 outline-dashed outline-primary' : '',
          ]"
          @dragover="onDragOver($event, folder.id)"
          @dragleave="dragOver = null"
          @drop="onDrop($event, folder.id)"
        >
          <UIcon
            v-if="i === 0"
            :name="currentFolderId === folder.id ? 'i-mdi-folder-open' : 'i-mdi-folder-outline'"
            class="size-5 shrink-0"
            aria-hidden="true"
          />
          <span class="flex-1">{{ folder.name }}</span>
          <span class="tabular-nums text-toned">{{ folder.recordIds.length }}<span class="sr-only"> records</span></span>
        </NuxtLink>
      </template>

      <form v-if="naming" class="px-1 pt-1" @submit.prevent="createFolder">
        <UInput
          ref="nameInput"
          v-model="newName"
          size="sm"
          placeholder="Folder name"
          aria-label="New folder name"
          @keydown.esc="naming = false"
          @blur="createFolder"
        />
      </form>
      <UButton
        v-else
        color="neutral"
        variant="ghost"
        icon="i-mdi-plus"
        label="New folder"
        class="justify-start"
        @click="startNaming"
      />
    </nav>

    <div role="group" aria-labelledby="bin-open-filter" class="flex flex-col gap-0.5 border-t border-default pt-4 text-sm">
      <h2 id="bin-open-filter" class="mb-1 px-2 text-xs font-medium text-muted">
        How records open
      </h2>
      <button
        v-for="option in filters"
        :key="option.id"
        type="button"
        :aria-pressed="filter === option.id"
        class="flex items-center gap-2 rounded-md px-2 py-1.5 text-start focus-visible:outline-2 focus-visible:outline-primary"
        :class="filter === option.id ? 'bg-accented font-semibold text-highlighted' : 'text-toned hover:bg-elevated'"
        @click="filter = filter === option.id ? null : option.id"
      >
        <UIcon
          :name="option.icon"
          class="size-5 shrink-0"
          :class="option.id === 'no-snippet' ? 'text-warning' : undefined"
          aria-hidden="true"
        />
        <span class="flex-1">{{ option.label }}</span>
        <span class="tabular-nums">{{ counts[option.id] }}</span>
      </button>
    </div>

    <div
      class="mt-auto flex flex-col items-center gap-2 rounded-lg border border-dashed px-3 py-5 text-center text-xs text-muted"
      :class="dragOver === 'zone' ? 'border-primary bg-elevated' : 'border-accented'"
      @dragover="dropZoneTarget && onDragOver($event, 'zone')"
      @dragleave="dragOver = null"
      @drop="dropZoneTarget && onDrop($event, dropZoneTarget)"
    >
      <UIcon name="i-mdi-tray-arrow-down" class="size-5" aria-hidden="true" />
      Drag records here from search results or the catalog
    </div>
  </div>
</template>
