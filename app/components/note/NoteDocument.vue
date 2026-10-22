<script setup lang="ts">
import type { Citation } from '#shared/types/citation'
import type { Note } from '#shared/types/note'
import type { CatalogRecord } from '#shared/types/record'
import type { NoteBlock } from '#shared/utils/note-body'

// The note as an article: title, byline, the editable body and the generated References.
// The editor runs in the browser; the server renders the same body read-only as a fallback.
const props = defineProps<{
  note: Note
  projectId: string
  blocks: NoteBlock[]
  cited: { citation: Citation, record: CatalogRecord }[]
}>()

const emit = defineEmits<{ change: [body: string] }>()

const { snippetById } = useNoteContext()
const { byId } = useUsers()

const byline = computed(() => {
  const editors = props.note.editorIds.map(id => byId.value.get(id)).filter(u => !!u)
  const others = editors.filter(u => !u.isCurrentUser).map(u => u.name)
  const names = editors.some(u => u.isCurrentUser) ? [...others, 'you'] : others
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0] ?? ''
  const count = props.cited.length
  return `${list} · Created ${formatShortDate(props.note.createdAt)} · ${count} ${count === 1 ? 'citation' : 'citations'}`
})
</script>

<template>
  <div class="pb-10" data-note-body>
    <ClientOnly>
      <NoteEditor :note="note" :project-id="projectId" @change="emit('change', $event)">
        <template #header>
          <NoteTitleBlock :title="note.title" :byline="byline" />
        </template>
      </NoteEditor>

      <template #fallback>
        <article class="mx-auto max-w-[70ch] px-6 pt-[105px] text-[18px]/[30px] text-default">
          <NoteTitleBlock :title="note.title" :byline="byline" />
          <template v-for="(block, i) in blocks" :key="i">
            <component
              :is="`h${block.level}`"
              v-if="block.type === 'heading'"
              class="mt-8 mb-2 text-[22px]/[30px] font-semibold text-highlighted"
            >
              <NoteInline :content="block.content" />
            </component>
            <p v-else-if="block.type === 'paragraph'" class="mb-4">
              <NoteInline :content="block.content" />
            </p>
            <ul v-else-if="block.type === 'list'" class="mb-4 list-disc ps-6">
              <li v-for="(item, j) in block.items" :key="j">
                <NoteInline :content="item" />
              </li>
            </ul>
            <NoteSnippetFigure
              v-else-if="block.type === 'snippet' && snippetById.get(block.snippetId)"
              :snippet="snippetById.get(block.snippetId)!"
              :author="byId.get(snippetById.get(block.snippetId)!.createdBy)"
            />
          </template>
        </article>
      </template>
    </ClientOnly>

    <div class="mx-auto max-w-[70ch] px-6">
      <NoteReferences :cited="cited" />
    </div>
  </div>
</template>
