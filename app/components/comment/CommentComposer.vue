<script setup lang="ts">
import type { CommentDraft } from '~/composables/useNoteComments'

// A new comment on the text selected in the note.
defineProps<{ draft: CommentDraft }>()
const emit = defineEmits<{ submit: [body: string], cancel: [] }>()

const text = ref('')
const textarea = useTemplateRef('textarea')

onMounted(() => textarea.value?.textareaRef?.focus())

function submit() {
  if (text.value.trim())
    emit('submit', text.value.trim())
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    submit()
  }
  else if (event.key === 'Escape') {
    event.stopPropagation()
    emit('cancel')
  }
}
</script>

<template>
  <form class="flex flex-col gap-2 rounded-lg border border-accented bg-default p-3 text-sm" @submit.prevent="submit">
    <p class="border-l-2 border-accented pl-2 text-xs text-muted">
      On “{{ draft.anchorText }}”
    </p>
    <UTextarea
      ref="textarea"
      v-model="text"
      :rows="3"
      autoresize
      placeholder="Add a comment"
      aria-label="New comment"
      @keydown="onKeyDown"
    />
    <div class="flex gap-2">
      <UButton
        type="submit"
        label="Comment"
        size="sm"
        :disabled="!text.trim()"
      />
      <UButton
        label="Cancel"
        size="sm"
        color="neutral"
        variant="ghost"
        @click="emit('cancel')"
      />
    </div>
  </form>
</template>
