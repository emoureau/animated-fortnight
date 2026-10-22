<script setup lang="ts">
import type { DropdownMenuItem, TreeItem } from '@nuxt/ui'
import type { Note } from '#shared/types/note'
import type { AvailabilityMode } from '#shared/types/record'
import type { Project } from '#shared/types/user'
import type { LinkedMention } from '~/composables/useNoteView'

// Concept A left column: project switcher, notes tree, linked mentions, sources and tags.
const props = defineProps<{
  project: Project
  note: Note
  projectNotes: Note[]
  linkedMentions: LinkedMention[]
  sourceCounts: Record<AvailabilityMode, number>
}>()

const { data: projects } = useFetch<Project[]>('/api/projects', { key: 'projects', default: () => [] })

const projectItems = computed<DropdownMenuItem[]>(() => projects.value.map(p => ({
  label: p.name,
  icon: p.id === props.project.id ? 'i-mdi-check' : undefined,
  to: `/p/${p.id}`,
})))

type NoteTreeItem = TreeItem & { id: string, noteId?: string }

// Folders from note.folder, in order of first appearance; notes without a folder go last.
const treeItems = computed<NoteTreeItem[]>(() => {
  const toItem = (n: Note): NoteTreeItem => ({
    id: n.id,
    noteId: n.id,
    label: n.title,
    icon: 'i-mdi-file-document-outline',
    // Selected rows are bg-accented (docs/design-rules.md); the tree's default matches the sidebar. See docs/ui-layer-requests.md.
    ui: n.id === props.note.id ? { link: 'before:bg-accented' } : undefined,
  })
  const folders = [...new Set(props.projectNotes.map(n => n.folder).filter(f => f !== null))]
  return [
    ...folders.map(folder => ({
      id: `folder:${folder}`,
      label: folder,
      icon: 'i-mdi-folder-outline',
      defaultExpanded: true,
      children: props.projectNotes.filter(n => n.folder === folder).map(toItem),
    })),
    ...props.projectNotes.filter(n => n.folder === null).map(toItem),
  ]
})

const selected = computed(() => treeItems.value
  .flatMap(item => item.children ? item.children as NoteTreeItem[] : [item])
  .find(item => item.noteId === props.note.id))

function openNote(item: NoteTreeItem | undefined) {
  if (item?.noteId && item.noteId !== props.note.id)
    navigateTo(`/p/${props.project.id}/notes/${item.noteId}`)
}

const sourceRows = computed(() => ([
  ['inline', 'Opens here'],
  ['download', 'Download only'],
  ['external', 'External site'],
  ['physical', 'Physical item'],
] as const).filter(([mode]) => props.sourceCounts[mode] > 0))
</script>

<template>
  <div class="flex flex-col gap-5">
    <UDropdownMenu :items="projectItems" :content="{ align: 'start' }" :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width)' }">
      <UButton
        color="neutral"
        variant="outline"
        block
        trailing-icon="i-mdi-unfold-more-horizontal"
        class="justify-start text-start p-2"
      >
        <span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-accented font-mono text-xs font-semibold text-toned" aria-hidden="true">
          {{ project.shortCode }}
        </span>
        <span class="flex flex-1 flex-col min-w-0">
          <span class="font-semibold text-highlighted">{{ project.name }}</span>
          <span class="text-xs text-muted">Team project · {{ project.memberIds.length }} members<span class="sr-only">, switch project</span></span>
        </span>
      </UButton>
    </UDropdownMenu>

    <nav aria-labelledby="notes-tree-heading" class="flex flex-col gap-1">
      <h2 id="notes-tree-heading" class="px-2 text-xs font-medium text-muted">
        Notes
      </h2>
      <UTree
        :items="treeItems"
        :model-value="selected"
        :get-key="item => item.id"
        color="neutral"
        @update:model-value="openNote($event as NoteTreeItem | undefined)"
      />
    </nav>

    <section v-if="linkedMentions.length" aria-labelledby="mentions-heading" class="flex flex-col gap-2 border-t border-default pt-4">
      <h2 id="mentions-heading" class="px-2 text-xs font-medium text-muted">
        Linked mentions
      </h2>
      <ul class="flex flex-col gap-1">
        <li v-for="mention in linkedMentions" :key="mention.note.id">
          <NuxtLink :to="`/p/${mention.note.projectId}/notes/${mention.note.id}`" class="flex flex-col gap-0.5 rounded-md px-2 py-1.5 hover:bg-accented">
            <span class="text-sm text-highlighted">{{ mention.note.title }}</span>
            <span class="text-xs text-muted line-clamp-2">“{{ mention.excerpt }}”</span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section v-if="sourceRows.length" aria-labelledby="sources-heading" class="flex flex-col gap-2 border-t border-default pt-4">
      <h2 id="sources-heading" class="px-2 text-xs font-medium text-muted">
        Sources in this note
      </h2>
      <ul class="flex flex-col gap-1 px-2 text-sm">
        <li v-for="[mode, word] in sourceRows" :key="mode" class="flex items-center gap-2">
          <UIcon :name="availabilityIcons[mode]" class="size-4 text-muted" aria-hidden="true" />
          <span class="flex-1">{{ word }}</span>
          <span class="tabular-nums text-toned">{{ sourceCounts[mode] }}</span>
        </li>
      </ul>
      <p class="px-2 text-xs text-muted">
        Readers see snippets for anything that can’t open here.
      </p>
    </section>

    <section v-if="note.tags.length" aria-labelledby="tags-heading" class="flex flex-col gap-2 border-t border-default pt-4">
      <h2 id="tags-heading" class="px-2 text-xs font-medium text-muted">
        Tags
      </h2>
      <ul class="flex flex-wrap gap-1.5 px-2">
        <li v-for="tag in note.tags" :key="tag">
          <UBadge
            color="neutral"
            variant="outline"
            :label="`#${tag}`"
            class="rounded-full"
          />
        </li>
      </ul>
    </section>
  </div>
</template>
