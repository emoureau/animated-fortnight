<script setup lang="ts">
import type { RecordNote } from '#shared/types/bin'
import type { Snippet } from '#shared/types/citation'
import type { Note } from '#shared/types/note'
import type { CatalogRecord } from '#shared/types/record'

// A note anchored to a record (spec 02, B1/B2). Its citation is part of it and can't be edited.
const props = defineProps<{
  note: RecordNote
  record: CatalogRecord
  /** Region number, shared with the viewer's badges */
  number?: number
  snippets: Snippet[]
  drafts: Note[]
}>()

const { byId } = useUsers()
const { selected, selecting, toggle } = useAssembly()

const author = computed(() => byId.value.get(props.note.authorId))
const color = computed(() => personClasses[author.value?.dataColor ?? 'person-1'])

/** B1: "Field Operations Unit, 1991, p. 4"; B2: "Survey title · line_14.xyz". */
const citation = computed(() => {
  const { locator } = props.note
  if (props.record.availability.mode === 'inline' && locator.kind !== 'whole')
    return `${props.record.creator}, ${props.record.date}, ${locator.label}`
  return locator.kind === 'whole' ? locator.label : `${shortTitle(props.record)} · ${locator.label}`
})

const attached = computed(() => (props.note.snippetIds ?? []).flatMap(id => props.snippets.find(s => s.id === id) ?? []))
const usedIn = computed(() => props.note.usedInNoteIds.flatMap(id => props.drafts.find(d => d.id === id) ?? []))
const inNextDraft = computed(() => selected.value.includes(props.note.id))
</script>

<template>
  <article
    :id="`record-note-${note.id}`"
    tabindex="-1"
    :aria-label="`Note by ${author?.name ?? 'a team member'} on ${note.locator.label}`"
    class="flex flex-col rounded-lg border border-default bg-elevated text-sm focus-visible:outline-2 focus-visible:outline-primary"
  >
    <header class="flex items-start gap-2 border-b border-default px-3 py-2 text-xs text-secondary">
      <span
        v-if="number"
        class="flex size-5 shrink-0 items-center justify-center rounded-full font-semibold text-data-label"
        :class="color.fill"
      >
        {{ number }}<span class="sr-only">, region</span>
      </span>
      <UIcon
        v-else-if="record.availability.mode !== 'inline'"
        :name="availabilityIcons[record.availability.mode]"
        class="mt-px size-4 shrink-0"
        aria-hidden="true"
      />
      <UIcon
        v-else
        name="i-mdi-file-document-outline"
        class="mt-px size-4 shrink-0"
        aria-hidden="true"
      />
      <p class="flex-1">
        <span class="sr-only">Locked citation: </span>
        {{ citation }} · <span class="font-mono">{{ record.catalogId }}</span>
      </p>
      <UIcon name="i-mdi-lock-outline" class="size-4 shrink-0 text-muted" aria-hidden="true" />
      <UCheckbox
        v-if="selecting"
        :model-value="inNextDraft"
        :aria-label="`Select note by ${author?.name ?? 'a team member'} on ${note.locator.label} for the draft`"
        @update:model-value="toggle(note.id, !!$event)"
      />
    </header>

    <div class="flex flex-col gap-3 p-3">
      <blockquote v-if="note.excerpt" class="border-l-2 border-accented pl-3 italic text-toned">
        “{{ note.excerpt }}”
      </blockquote>
      <ul v-if="attached.length" class="flex flex-col gap-2">
        <li v-for="snippet in attached" :key="snippet.id" class="flex items-center gap-3 rounded-md bg-accented p-2 text-xs text-toned">
          <img
            v-if="snippet.kind === 'image' && snippet.imagePath"
            :src="snippet.imagePath"
            alt=""
            class="h-8 w-14 shrink-0 rounded-sm object-cover"
          >
          <UIcon
            v-else
            name="i-mdi-text-box-outline"
            class="size-5 shrink-0"
            aria-hidden="true"
          />
          <span>Snippet: {{ snippet.caption }}<span v-if="snippet.sourceFile" class="font-mono"> · {{ snippet.sourceFile }}</span></span>
        </li>
      </ul>
      <p class="text-default">
        {{ note.body }}
      </p>
      <footer class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        <PersonAvatar v-if="author" :user="author" size="2xs" />
        <span>{{ author?.name }} · {{ formatShortDate(note.createdAt) }}</span>
        <span class="ms-auto flex flex-wrap items-center gap-2">
          <span v-if="note.flags.includes('follow-up')" class="flex items-center gap-1 rounded-sm bg-warning/10 px-1.5 py-0.5 text-warning">
            <UIcon name="i-mdi-flag-outline" class="size-3.5" aria-hidden="true" />
            Follow-up
          </span>
          <!-- A state, not an action: neutral text, icon plus words (design rule 2) -->
          <span v-if="inNextDraft" class="flex items-center gap-1 text-toned">
            <UIcon name="i-mdi-check" class="size-3.5" aria-hidden="true" />
            In next draft
          </span>
          <UPopover v-if="usedIn.length">
            <button type="button" class="text-primary underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-primary">
              Used in {{ usedIn.length }} {{ usedIn.length === 1 ? 'draft' : 'drafts' }}
            </button>
            <template #content>
              <ul class="flex flex-col p-1 text-sm">
                <li v-for="draft in usedIn" :key="draft.id">
                  <NuxtLink :to="`/p/${draft.projectId}/notes/${draft.id}`" class="block rounded-md px-2 py-1.5 hover:bg-elevated">
                    {{ draft.title }}
                  </NuxtLink>
                </li>
              </ul>
            </template>
          </UPopover>
        </span>
      </footer>
    </div>
  </article>
</template>
