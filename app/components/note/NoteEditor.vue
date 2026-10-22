<script setup lang="ts">
import type { SuggestionProps } from '@tiptap/suggestion'
import type { Editor, Range } from '@tiptap/vue-3'
import type { Citation, Locator } from '#shared/types/citation'
import type { Note, Presence } from '#shared/types/note'
import type { CatalogRecord } from '#shared/types/record'
import type { SaveStatus } from './NoteSaveStatus.vue'
import { exitSuggestion } from '@tiptap/suggestion'
import { citationOrder, parseNoteBody } from '#shared/utils/note-body'
import { noteNodes } from '~/editor'
import { CiteTrigger, citeTriggerKey } from '~/editor/citeTrigger'
import { CollabDecorations, commentAt, setCollabData } from '~/editor/collabDecorations'
import { occurrenceAt } from '~/editor/findText'

// Concept A editor (spec 01): TipTap through UEditor, Markdown in and out, autosave, [[ to cite.
// Live co-editing (e.g. Yjs) can be added later as another extension; nothing here assumes one writer.
const props = defineProps<{
  note: Note
  projectId: string
}>()

const emit = defineEmits<{
  /** The full body (with its `# Title` line) after every edit */
  change: [body: string]
}>()

const { recordById, activate, addCitation, comments, panelTab, openThread } = useNoteContext()
const { byId } = useUsers()

// The page shows the title as its h1, so the editor holds the body without the `# Title` line.
const TITLE_LINE = /^# [^\n]*\n+/
const markdown = ref(props.note.body.replace(TITLE_LINE, ''))
const fullBody = (md: string) => `# ${props.note.title}\n\n${md.trim()}\n`

// Autosave
const status = ref<SaveStatus>('saved')
let saveTimer: ReturnType<typeof setTimeout> | undefined
let pending: string | null = null

async function save() {
  if (pending === null)
    return
  const body = pending
  pending = null
  try {
    await $fetch(`/api/notes/${props.note.id}`, {
      method: 'PUT',
      body: { body, citationIds: citationOrder(parseNoteBody(body)) },
    })
    status.value = pending === null ? 'saved' : 'saving'
  }
  catch {
    status.value = 'error'
  }
}

watch(markdown, (md) => {
  const body = fullBody(md)
  emit('change', body)
  pending = body
  status.value = 'saving'
  clearTimeout(saveTimer)
  saveTimer = setTimeout(save, 800)
})

onBeforeUnmount(() => {
  clearTimeout(saveTimer)
  save()
})

// Cite popover, driven by the [[ suggestion
const editorRef = useTemplateRef<{ editor: Editor | undefined }>('editorRef')
const editor = computed<Editor | undefined>(() => editorRef.value?.editor)
const popover = useTemplateRef('popover')

const cite = reactive({
  open: false,
  query: '',
  range: null as Range | null,
  rect: null as (() => DOMRect | null) | null,
})

function track(props: SuggestionProps) {
  cite.query = props.query
  cite.range = props.range
  cite.rect = props.clientRect ?? null
}

const citeTrigger = CiteTrigger.configure({
  handlers: {
    onOpen: (p) => {
      track(p)
      cite.open = true
    },
    onUpdate: track,
    onClose: () => { cite.open = false },
    onKeyDown: event => popover.value?.onKeyDown(event) ?? false,
  },
})
const extensions = [
  ...noteNodes,
  citeTrigger,
  CollabDecorations.configure({ onOpenComment: id => openThread(id) }),
]

const reference = computed(() => cite.rect
  ? { getBoundingClientRect: () => cite.rect?.() ?? new DOMRect() }
  : undefined)

function closeCite() {
  if (editor.value)
    exitSuggestion(editor.value.view, citeTriggerKey)
  cite.open = false
  editor.value?.commands.focus()
}

async function insertCitation(record: CatalogRecord, locator: Locator) {
  const range = cite.range
  if (!editor.value || !range)
    return
  const external = record.availability.mode === 'external' ? record.availability : null
  const citation = await $fetch<Citation>('/api/citations', {
    method: 'POST',
    body: {
      recordId: record.id,
      locator,
      // External records keep a snapshot; a broken link can only point at the last one.
      ...external && { snapshotAt: external.linkStatus === 'broken' ? external.snapshotAt : new Date().toISOString() },
    },
  })
  addCitation(citation)
  editor.value.chain().focus().insertContentAt(range, [
    { type: 'citation', attrs: { citationId: citation.id } },
    { type: 'text', text: ' ' },
  ]).run()
  activate(citation.id)
}

// Block type label in the toolbar follows the caret. The last selection is kept so a cite
// request from search lands where the caret was, not where focus-return puts it.
const revision = ref(0)
let lastSelection = { from: 1, to: 1 }
watch(editor, (e) => {
  e?.on('transaction', () => revision.value++)
  e?.on('blur', ({ editor: ed }) => {
    lastSelection = { from: ed.state.selection.from, to: ed.state.selection.to }
  })
}, { immediate: true })

// Faked collaboration: teammates' carets and selections, and comment anchors (spec 01).
const { data: presence } = useFetch<Presence[]>('/api/presence', { query: { noteId: props.note.id }, default: () => [] })

watch([editor, presence, comments.open, comments.activeCommentId, byId], ([e]) => {
  if (!e)
    return
  const person = (id: string) => {
    const user = byId.value.get(id)
    return user && { name: user.name, color: user.dataColor }
  }
  setCollabData(e, {
    presence: presence.value.flatMap((p) => {
      const who = person(p.userId)
      return who ? [{ person: who, cursorAfterText: p.cursorAfterText, selectionText: p.selectionText }] : []
    }),
    comments: comments.open.value.flatMap((c) => {
      const author = person(c.authorId)
      return author
        ? [{ id: c.id, anchorText: c.anchorText, anchorIndex: c.anchorIndex ?? 0, author, preview: c.body.slice(0, 80) }]
        : []
    }),
    activeCommentId: comments.activeCommentId.value,
  })
}, { immediate: true })

// The caret inside a commented passage brings up its thread under the record (A1).
watch(editor, (e) => {
  e?.on('selectionUpdate', ({ editor: ed }) => {
    comments.activeCommentId.value = commentAt(ed.state, ed.state.selection.from)
  })
}, { immediate: true })

/** Toolbar Comment: start a new thread on the selected text. */
function startComment() {
  const e = editor.value
  if (!e || e.state.selection.empty)
    return
  const { from, to } = e.state.selection
  const anchorText = e.state.doc.textBetween(from, to, ' ').trim()
  if (!anchorText)
    return
  comments.draft.value = { anchorText, anchorIndex: occurrenceAt(e.state.doc, anchorText, from) }
  panelTab.value = 'comments'
}

// Omnisearch "Cite in current note": open the popover on that record.
const citeRequest = useState<string | null>('cite-request', () => null)
watch([citeRequest, editor], ([recordId, e]) => {
  const record = recordId ? recordById.value.get(recordId) : undefined
  if (!e || !record)
    return
  citeRequest.value = null
  e.chain().focus().setTextSelection(lastSelection).insertContent(` [[${record.catalogId}`).run()
}, { immediate: true })
</script>

<template>
  <UEditor
    ref="editorRef"
    v-slot="{ editor: tiptap }"
    v-model="markdown"
    content-type="markdown"
    :extensions="extensions"
    :editor-props="{ attributes: { 'aria-label': `Text of ${note.title}` } }"
    :starter-kit="{ heading: { levels: [2, 3] }, codeBlock: false, code: false, horizontalRule: false, strike: false, underline: false }"
    placeholder="Write, or type [[ to cite a record"
    class="flex flex-col"
    :ui="{
      content: 'mx-auto w-full max-w-[70ch] px-6 pb-4',
      base: 'sm:px-0 text-[18px] [&_p]:leading-[30px] [&_li]:leading-[30px] [&_h2]:text-[22px] [&_h2]:leading-[30px] [&_h2]:font-semibold [&_h3]:font-semibold',
    }"
  >
    <NoteEditorToolbar
      :editor="tiptap"
      :status="status"
      :revision="revision"
      @comment="startComment"
    />
    <div class="mx-auto w-full max-w-[70ch] px-6 pt-10 pb-6">
      <slot name="header" />
    </div>
    <CitePopover
      ref="popover"
      :open="cite.open"
      :query="cite.query"
      :reference="reference"
      :project-id="projectId"
      @insert="insertCitation"
      @cancel="closeCite"
      @back="editor?.commands.focus()"
    />
  </UEditor>
</template>
