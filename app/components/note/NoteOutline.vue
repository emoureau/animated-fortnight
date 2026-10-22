<script setup lang="ts">
import type { NoteBlock } from '#shared/utils/note-body'
import { inlineText } from '#shared/utils/note-body'

// Heading list; activating one scrolls to it and moves focus there.
const props = defineProps<{ blocks: NoteBlock[] }>()

const headings = computed(() => props.blocks.flatMap(block =>
  block.type === 'heading' ? [{ level: block.level, text: inlineText(block.content) }] : []))

/** Headings are found by position in the note body (the editor doesn't give them ids). */
function go(index: number) {
  const el = document.querySelectorAll<HTMLElement>('[data-note-body] :is(h2, h3)')[index]
  if (!el)
    return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
  el.addEventListener('blur', () => el.removeAttribute('tabindex'), { once: true })
}
</script>

<template>
  <p v-if="!headings.length" class="text-sm text-muted">
    This note has no headings.
  </p>
  <nav v-else aria-label="Outline">
    <ul class="flex flex-col gap-0.5">
      <li v-for="(heading, i) in headings" :key="i" :class="heading.level === 3 ? 'ps-4' : undefined">
        <UButton
          color="neutral"
          variant="ghost"
          :label="heading.text"
          block
          class="justify-start text-start"
          @click="go(i)"
        />
      </li>
    </ul>
  </nav>
</template>
