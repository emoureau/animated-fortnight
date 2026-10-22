<script setup lang="ts">
import type { RecordNote } from '#shared/types/bin'
import type { Rect } from '#shared/types/citation'
import type { CatalogRecord, InlineAvailability } from '#shared/types/record'

// Inline record viewer (spec 02, B1): page navigation and zoom, note regions numbered in their
// authors' colors, and selecting a region (drag), lines (click, Shift+click) or lines by keyboard.
const props = defineProps<{
  record: CatalogRecord
  availability: InlineAvailability
  notes: RecordNote[]
}>()

const emit = defineEmits<{ noteFromSelection: [] }>()

const { byId, currentUser } = useUsers()
const binSelection = useBinSelection()

const isDocument = computed(() => props.record.type === 'document')
const total = computed(() => props.availability.pages ?? props.availability.frames ?? 1)
const unit = computed(() => isDocument.value ? 'Page' : 'Frame')

// Open on the first page that has a note region (page 4 of the storm report, as in B1).
const firstNotedPage = computed(() => props.notes.find(n => n.locator.kind === 'page' && n.locator.region)?.locator)
const page = ref(firstNotedPage.value?.kind === 'page' ? firstNotedPage.value.page : 1)
const zoom = ref(100)
watch(() => props.record.id, () => {
  page.value = firstNotedPage.value?.kind === 'page' ? firstNotedPage.value.page : 1
  zoom.value = 100
  clearSelection()
})

const layout = computed(() => pageLayout(page.value))
const numbers = computed(() => regionNumbers(props.notes))
const regions = computed(() => props.notes.flatMap((note) => {
  const n = numbers.value.get(note.id)
  if (!n || note.locator.kind !== 'page' || note.locator.page !== page.value || !note.locator.region)
    return []
  const author = byId.value.get(note.authorId)
  return [{ id: note.id, n, rect: note.locator.region, color: author?.dataColor ?? 'person-1', author: author?.name }]
}))

const mine = computed(() => personClasses[currentUser.value?.dataColor ?? 'person-1'])
const box = (r: Rect) => ({ left: `${r.x * 100}%`, top: `${r.y * 100}%`, width: `${r.w * 100}%`, height: `${r.h * 100}%` })

// Selection: a rect on the page, made by dragging or from a run of lines.
const selection = ref<Rect | null>(null)
const lineAnchor = ref<number | null>(null)
const lineCursor = ref<number | null>(null)
const announcement = ref('')

function clearSelection() {
  selection.value = null
  lineAnchor.value = null
  lineCursor.value = null
}

function selectLines(anchor: number, cursor: number) {
  lineAnchor.value = anchor
  lineCursor.value = cursor
  selection.value = linesRect(layout.value, anchor, cursor)
  const [a, b] = anchor <= cursor ? [anchor, cursor] : [cursor, anchor]
  announcement.value = a === b ? `Line ${a + 1} selected on page ${page.value}` : `Lines ${a + 1}–${b + 1} selected on page ${page.value}`
}

function goTo(next: number) {
  page.value = Math.min(Math.max(1, next), total.value)
  clearSelection()
}

// Pointer: drag for a region, click for a line.
const pageEl = useTemplateRef<HTMLElement>('pageEl')
let dragStart: { x: number, y: number } | null = null

function point(event: PointerEvent) {
  const r = pageEl.value!.getBoundingClientRect()
  return {
    x: Math.min(Math.max((event.clientX - r.left) / r.width, 0), 1),
    y: Math.min(Math.max((event.clientY - r.top) / r.height, 0), 1),
  }
}

function onPointerDown(event: PointerEvent) {
  if (!isDocument.value || event.button !== 0)
    return
  pageEl.value?.setPointerCapture(event.pointerId)
  dragStart = point(event)
}

function onPointerMove(event: PointerEvent) {
  if (!dragStart)
    return
  const p = point(event)
  const rect = { x: Math.min(dragStart.x, p.x), y: Math.min(dragStart.y, p.y), w: Math.abs(p.x - dragStart.x), h: Math.abs(p.y - dragStart.y) }
  if (rect.w > 0.02 || rect.h > 0.02) {
    selection.value = rect
    lineAnchor.value = null
  }
}

function onPointerUp(event: PointerEvent) {
  if (!dragStart)
    return
  const start = dragStart
  dragStart = null
  const p = point(event)
  if (Math.abs(p.x - start.x) > 0.02 || Math.abs(p.y - start.y) > 0.02) {
    announcement.value = `Region selected on page ${page.value}`
    return
  }
  // A click: select the line under it, or extend with Shift.
  const line = lineAt(layout.value, p.y)
  if (!line) {
    clearSelection()
    return
  }
  selectLines(event.shiftKey && lineAnchor.value !== null ? lineAnchor.value : line.index, line.index)
}

// Keyboard: one tab stop; arrows move a line cursor, Shift extends, Enter makes the note.
function onKeyDown(event: KeyboardEvent) {
  if (!isDocument.value)
    return
  const last = layout.value.lines.length - 1
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const from = lineCursor.value ?? (event.key === 'ArrowDown' ? -1 : last + 1)
    const cursor = Math.min(Math.max(from + (event.key === 'ArrowDown' ? 1 : -1), 0), last)
    selectLines(event.shiftKey && lineAnchor.value !== null ? lineAnchor.value : cursor, cursor)
  }
  else if (event.key === 'Enter' && selection.value) {
    event.preventDefault()
    noteFromSelection()
  }
  else if (event.key === 'Escape' && selection.value) {
    event.preventDefault()
    clearSelection()
    announcement.value = 'Selection cleared'
  }
}

function noteFromSelection() {
  if (!selection.value)
    return
  binSelection.value = {
    recordId: props.record.id,
    locator: { kind: 'page', label: `p. ${page.value}`, page: page.value, region: roundRect(selection.value) },
  }
  clearSelection()
  emit('noteFromSelection')
}

/** Images and image sets: no regions (frame locators have none), so note the frame or the image. */
function noteOnFrame() {
  binSelection.value = {
    recordId: props.record.id,
    locator: props.availability.frames
      ? { kind: 'frame', label: `frame ${page.value}` }
      : { kind: 'whole', label: 'Whole record' },
  }
  emit('noteFromSelection')
}

const instructionsId = useId()
</script>

<template>
  <div class="flex flex-col items-center gap-4 bg-(--ui-color-neutral-950) px-4 py-5">
    <div class="flex items-center gap-2 text-sm text-default">
      <UButton
        color="neutral"
        variant="outline"
        icon="i-mdi-chevron-left"
        :aria-label="`Previous ${unit.toLowerCase()}`"
        :disabled="page <= 1"
        @click="goTo(page - 1)"
      />
      <span aria-live="polite" class="tabular-nums">{{ unit }} {{ page }} of {{ total }}</span>
      <UButton
        color="neutral"
        variant="outline"
        icon="i-mdi-chevron-right"
        :aria-label="`Next ${unit.toLowerCase()}`"
        :disabled="page >= total"
        @click="goTo(page + 1)"
      />
      <span class="mx-2 h-5 border-s border-accented" aria-hidden="true" />
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-mdi-minus"
        aria-label="Zoom out"
        :disabled="zoom <= 50"
        @click="zoom -= 25"
      />
      <span class="w-12 text-center tabular-nums" aria-live="polite">{{ zoom }}%</span>
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-mdi-plus"
        aria-label="Zoom in"
        :disabled="zoom >= 200"
        @click="zoom += 25"
      />
    </div>

    <div class="max-w-full overflow-auto">
      <div
        ref="pageEl"
        class="relative touch-none select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        :class="isDocument ? 'cursor-crosshair' : ''"
        :style="{ width: `${4.2 * zoom}px` }"
        :tabindex="isDocument ? 0 : undefined"
        :role="isDocument ? 'group' : undefined"
        :aria-label="isDocument ? `${unit} ${page} of ${record.title}` : undefined"
        :aria-describedby="isDocument ? instructionsId : undefined"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @keydown="onKeyDown"
      >
        <RecordPageStandIn :kind="isDocument ? 'page' : 'image'" :page="page" />

        <!-- Note regions, numbered in the author's color -->
        <div
          v-for="region in regions"
          :key="region.id"
          class="pointer-events-none absolute border-2"
          :class="[personClasses[region.color].border, personClasses[region.color].tint]"
          :style="box(region.rect)"
        >
          <span
            class="absolute -top-3 -left-3 flex size-6 items-center justify-center rounded-full text-xs font-semibold text-data-label"
            :class="personClasses[region.color].fill"
          >
            {{ region.n }}<span class="sr-only">, note by {{ region.author }}</span>
          </span>
        </div>

        <!-- Your new selection -->
        <div
          v-if="selection"
          class="pointer-events-none absolute border-2 border-dashed"
          :class="mine.border"
          :style="box(selection)"
        />
        <div
          v-if="selection"
          class="absolute z-10 flex gap-1 rounded-lg border border-default bg-elevated p-1 shadow-md"
          :style="{ left: `${(selection.x + selection.w) * 100}%`, top: `calc(${(selection.y + selection.h) * 100}% + 8px)`, transform: 'translateX(-100%)' }"
          @pointerdown.stop
        >
          <UButton icon="i-mdi-plus" label="Note from selection" @click="noteFromSelection" />
        </div>
      </div>
    </div>

    <p :id="instructionsId" class="text-center text-xs text-muted">
      <template v-if="isDocument">
        Select text or drag a region to start a note that cites this exact page.
        <span class="sr-only">With the keyboard: arrow keys select lines, Shift with arrows extends, Enter starts the note, Escape clears.</span>
      </template>
      <template v-else>
        Regions can’t be marked on images yet. Note the {{ availability.frames ? 'frame' : 'image' }} instead.
      </template>
    </p>
    <UButton
      v-if="!isDocument"
      icon="i-mdi-plus"
      :label="availability.frames ? `Note on frame ${page}` : 'Note on this image'"
      @click="noteOnFrame"
    />
    <p class="sr-only" aria-live="polite">
      {{ announcement }}
    </p>
  </div>
</template>
