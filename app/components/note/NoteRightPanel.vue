<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import type { Citation } from '#shared/types/citation'
import type { Note } from '#shared/types/note'
import type { CatalogRecord } from '#shared/types/record'
import type { NoteBlock } from '#shared/utils/note-body'

defineProps<{
  active?: { citation: Citation, record: CatalogRecord }
  alsoCitedIn: { note: Note, count: number }[]
  blocks: NoteBlock[]
}>()

const { panelTab, comments } = useNoteContext()
const { open, activeCommentId, reply, resolve } = comments

// A1: the comment on the passage the caret is in, under the record.
const activeComment = computed(() => open.value.find(c => c.id === activeCommentId.value))

const items = computed<TabsItem[]>(() => [
  { label: 'Record', value: 'record', slot: 'record' as const },
  {
    label: 'Comments',
    value: 'comments',
    slot: 'comments' as const,
    badge: open.value.length ? { label: String(open.value.length), color: 'neutral', variant: 'soft' } : undefined,
  },
  { label: 'Outline', value: 'outline', slot: 'outline' as const },
])
</script>

<template>
  <UTabs
    v-model="panelTab"
    :items="items"
    variant="link"
    :ui="{ root: 'gap-4', list: 'px-0' }"
  >
    <template #record>
      <div class="flex flex-col gap-5">
        <RecordPanel
          v-if="active"
          :record="active.record"
          :citation="active.citation"
          :also-cited-in="alsoCitedIn"
        />
        <p v-else class="text-sm text-muted">
          Hover or select a citation to see its record here.
        </p>
        <section v-if="activeComment" class="flex flex-col gap-2 border-t border-default pt-4">
          <h3 class="text-xs font-medium text-muted">
            Comment on the highlighted passage
          </h3>
          <CommentThread
            :comment="activeComment"
            hide-anchor
            @reply="reply(activeComment.id, $event)"
            @resolve="resolve(activeComment.id)"
          />
        </section>
      </div>
    </template>
    <template #comments>
      <NoteComments />
    </template>
    <template #outline>
      <NoteOutline :blocks="blocks" />
    </template>
  </UTabs>
</template>
