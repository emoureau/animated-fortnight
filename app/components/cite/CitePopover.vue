<script setup lang="ts">
import type { BinFolder } from '#shared/types/bin'
import type { Locator } from '#shared/types/citation'
import type { CatalogRecord } from '#shared/types/record'

// The [[ citation picker (spec 01, Citing). Keys arrive from the editor through onKeyDown();
// the locator field handles its own.
const props = defineProps<{
  open: boolean
  query: string
  /** Virtual element at the caret */
  reference?: { getBoundingClientRect: () => DOMRect }
  projectId: string
}>()

const emit = defineEmits<{
  insert: [record: CatalogRecord, locator: Locator]
  /** Close and leave the typed text */
  cancel: []
  /** Shift+Tab from the locator: back to the editor, popover stays */
  back: []
}>()

const { data: records } = useFetch<CatalogRecord[]>('/api/records', { key: 'records', default: () => [] })
const { data: folders } = useFetch<BinFolder[]>(() => `/api/projects/${props.projectId}/folders`, { default: () => [] })
const binIds = computed(() => new Set(folders.value.flatMap(f => f.recordIds)))

const scope = ref<'bin' | 'catalog'>('bin')
const highlighted = ref(0)
const locatorText = ref('')
const locatorTouched = ref(false)
const error = ref<string | null>(null)

const locatorInput = useTemplateRef('locatorInput')
const scopeButtons = useTemplateRef<HTMLElement>('scopeGroup')

function matches(record: CatalogRecord, q: string) {
  const needle = q.trim().toLowerCase()
  return !needle || [record.title, record.catalogId, ...record.keywords].some(f => f.toLowerCase().includes(needle))
}

const inScope = (s: 'bin' | 'catalog') => records.value.filter(r => (s === 'catalog' || binIds.value.has(r.id)) && matches(r, props.query))
const results = computed(() => inScope(scope.value).slice(0, 8))
const total = computed(() => inScope(scope.value).length)
const current = computed(() => results.value[highlighted.value])

const listId = useId()
const optionId = (i: number) => `${listId}-${i}`

watch(() => props.open, (open) => {
  if (open) {
    scope.value = 'bin'
    locatorTouched.value = false
    error.value = null
  }
})

// Nothing in the bin but something in the catalog (e.g. "Cite in current note" from search): show the catalog.
watch([() => props.query, scope], () => {
  highlighted.value = 0
  if (scope.value === 'bin' && !inScope('bin').length && inScope('catalog').length)
    scope.value = 'catalog'
})

watch(current, (record) => {
  error.value = null
  if (record && !locatorTouched.value)
    locatorText.value = defaultLocatorText(record)
}, { immediate: true })

function move(delta: number) {
  const n = results.value.length
  if (n)
    highlighted.value = (highlighted.value + delta + n) % n
}

function openRecord() {
  if (current.value)
    window.open(`/records/${current.value.id}`, '_blank')
}

function focusLocator() {
  locatorInput.value?.inputRef?.focus()
}

function submit() {
  const record = current.value
  if (!record)
    return
  const locator = parseLocator(locatorText.value, record)
  if (!locator) {
    error.value = 'Use a page, like p. 12, or “Whole record”.'
    focusLocator()
    return
  }
  emit('insert', record, locator)
}

/** Keys from the editor while the popover is open. */
function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    move(event.key === 'ArrowDown' ? 1 : -1)
    return true
  }
  if (event.key === 'Enter') {
    if (event.metaKey || event.ctrlKey)
      openRecord()
    else
      submit()
    return true
  }
  if (event.key === 'Tab' && !event.shiftKey) {
    focusLocator()
    return true
  }
  return false
}

function onLocatorKeyDown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    move(event.key === 'ArrowDown' ? 1 : -1)
  }
  else if (event.key === 'Enter') {
    event.preventDefault()
    if (event.metaKey || event.ctrlKey)
      openRecord()
    else
      submit()
  }
  else if (event.key === 'Escape') {
    event.preventDefault()
    emit('cancel')
  }
  else if (event.key === 'Tab' && event.shiftKey) {
    event.preventDefault()
    emit('back')
  }
  else if (event.key === 'Tab') {
    // Keep focus in the popover: locator → scope toggle
    event.preventDefault()
    scopeButtons.value?.querySelector<HTMLButtonElement>('button')?.focus()
  }
}

function recordMeta(record: CatalogRecord) {
  const a = record.availability
  const size = a.mode === 'download'
    ? `.${formatExtension(a.format).toLowerCase()} · ${formatBytes(a.sizeBytes)}`
    : a.mode === 'inline' && a.pages ? `${a.pages} pp.` : null
  return [recordTypeLabels[record.type], size, binIds.value.has(record.id) ? 'In this project’s bin' : 'Catalog']
    .filter(Boolean)
    .join(' · ')
}

defineExpose({ onKeyDown, focusLocator })
</script>

<template>
  <UPopover
    :open="open"
    :reference="reference"
    :content="{
      side: 'bottom',
      align: 'start',
      onOpenAutoFocus: (e: Event) => e.preventDefault(),
      onCloseAutoFocus: (e: Event) => e.preventDefault(),
    }"
    @update:open="(value: boolean) => { if (!value) emit('cancel') }"
  >
    <template #content>
      <div class="w-[500px] max-w-[calc(100vw-2rem)] flex flex-col text-sm" aria-label="Cite a record">
        <div class="flex items-center gap-2 border-b border-default p-2">
          <div
            ref="scopeGroup"
            role="radiogroup"
            aria-label="Search in"
            class="flex gap-1"
          >
            <UButton
              v-for="option in [{ value: 'bin', label: 'Project bin' }, { value: 'catalog', label: 'Whole catalog' }] as const"
              :key="option.value"
              role="radio"
              :aria-checked="scope === option.value"
              :label="option.label"
              color="neutral"
              :variant="scope === option.value ? 'subtle' : 'ghost'"
              size="sm"
              @click="scope = option.value"
              @keydown.tab.exact="option.value === 'catalog' && ($event.preventDefault(), focusLocator())"
            />
          </div>
          <span class="ms-auto text-xs text-muted" aria-live="polite">
            {{ total }} {{ total === 1 ? 'match' : 'matches' }}<template v-if="query.trim()">
              for “{{ query.trim() }}”
            </template>
          </span>
        </div>

        <ul
          v-if="results.length"
          :id="listId"
          role="listbox"
          aria-label="Records"
          class="max-h-80 overflow-y-auto p-1"
        >
          <li
            v-for="(record, i) in results"
            :id="optionId(i)"
            :key="record.id"
            role="option"
            :aria-selected="i === highlighted"
            class="flex items-start gap-3 rounded-md px-2.5 py-2 cursor-pointer"
            :class="i === highlighted ? 'bg-accented' : 'hover:bg-elevated'"
            @mousemove="highlighted = i"
            @click="highlighted = i; submit()"
          >
            <UIcon :name="recordTypeIcons[record.type]" class="mt-0.5 size-5 shrink-0 text-toned" aria-hidden="true" />
            <span class="flex flex-1 flex-col min-w-0">
              <span class="font-medium text-highlighted">{{ record.title }}</span>
              <span :class="i === highlighted ? 'text-toned' : 'text-muted'" class="text-xs">
                {{ recordMeta(record) }} · <span class="font-mono">{{ record.catalogId }}</span>
              </span>
            </span>
            <RecordAvailabilityBadge :availability="record.availability" class="shrink-0" />
          </li>
        </ul>
        <p v-else class="p-4 text-muted">
          No records match. Try the whole catalog.
        </p>

        <div class="flex flex-col gap-2 border-t border-default p-3">
          <div class="flex items-center gap-3">
            <label :for="`${listId}-locator`" class="shrink-0 text-toned">Where in it?</label>
            <UInput
              :id="`${listId}-locator`"
              ref="locatorInput"
              v-model="locatorText"
              class="flex-1"
              :aria-invalid="!!error"
              :aria-describedby="error ? `${listId}-error` : undefined"
              :aria-activedescendant="current ? optionId(highlighted) : undefined"
              :aria-controls="listId"
              @update:model-value="locatorTouched = true"
              @keydown="onLocatorKeyDown"
            />
          </div>
          <p v-if="error" :id="`${listId}-error`" class="flex items-center gap-1.5 text-xs text-error">
            <UIcon name="i-mdi-alert-circle-outline" class="size-4" aria-hidden="true" />
            {{ error }}
          </p>
          <p v-else-if="current?.availability.mode === 'external'" class="flex items-center gap-1.5 text-xs text-muted">
            <UIcon name="i-mdi-check" class="size-4 text-success" aria-hidden="true" />
            A snapshot of the page is saved with the citation in case the link changes.
          </p>
          <p class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <span class="flex items-center gap-1"><UKbd value="enter" /> Insert citation</span>
            <span class="flex items-center gap-1"><UKbd value="tab" /> Cite a page or region</span>
            <span class="flex items-center gap-1"><UKbd value="meta" /><UKbd value="enter" /> Open record</span>
          </p>
        </div>
      </div>
    </template>
  </UPopover>
</template>
