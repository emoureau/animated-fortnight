<script setup lang="ts">
import type { Comment } from '#shared/types/note'

// One comment thread: anchor quote, comment and replies, then Reply and Resolve (spec 01).
const props = defineProps<{
  comment: Comment
  /** Hide the quoted anchor (the Record tab card sits next to the passage already) */
  hideAnchor?: boolean
}>()

const emit = defineEmits<{
  reply: [body: string]
  resolve: []
}>()

const { byId } = useUsers()
const replying = ref(false)
const text = ref('')
const textarea = useTemplateRef('textarea')
const headingId = useId()

const entries = computed(() => [props.comment, ...props.comment.replies])
const author = computed(() => byId.value.get(props.comment.authorId))

async function startReply() {
  replying.value = true
  await nextTick()
  textarea.value?.textareaRef?.focus()
}

function send() {
  if (!text.value.trim())
    return
  emit('reply', text.value.trim())
  text.value = ''
  replying.value = false
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    send()
  }
  else if (event.key === 'Escape') {
    event.stopPropagation()
    replying.value = false
  }
}

defineExpose({ startReply })
</script>

<template>
  <article
    :id="`thread-${comment.id}`"
    tabindex="-1"
    :aria-labelledby="headingId"
    class="flex flex-col gap-2 rounded-lg border border-default bg-default p-3 text-sm focus-visible:outline-2 focus-visible:outline-primary"
  >
    <h3 :id="headingId" class="sr-only">
      Comment by {{ author?.name }} on “{{ comment.anchorText }}”
    </h3>
    <p v-if="!hideAnchor" class="border-l-2 border-accented pl-2 text-xs text-muted">
      On “{{ comment.anchorText }}”
    </p>

    <div
      v-for="(entry, i) in entries"
      :key="i"
      class="flex flex-col gap-1"
      :class="i > 0 ? 'ms-4 border-t border-default pt-2' : undefined"
    >
      <p class="flex items-center gap-2">
        <PersonAvatar v-if="byId.get(entry.authorId)" :user="byId.get(entry.authorId)!" size="2xs" />
        <span class="font-medium text-highlighted">{{ byId.get(entry.authorId)?.name }}</span>
        <span class="text-xs text-muted">{{ formatAge(entry.createdAt) }}</span>
      </p>
      <p>{{ entry.body }}</p>
    </div>

    <p v-if="comment.resolved" class="flex items-center gap-1.5 text-xs text-success">
      <UIcon name="i-mdi-check-circle-outline" class="size-4" aria-hidden="true" />
      Resolved
    </p>

    <template v-else>
      <div v-if="replying" class="flex flex-col gap-2">
        <UTextarea
          ref="textarea"
          v-model="text"
          :rows="2"
          autoresize
          placeholder="Write a reply"
          :aria-label="`Reply to ${author?.name ?? 'comment'}`"
          @keydown="onKeyDown"
        />
        <div class="flex gap-2">
          <UButton
            label="Reply"
            size="sm"
            :disabled="!text.trim()"
            @click="send"
          />
          <UButton
            label="Cancel"
            size="sm"
            color="neutral"
            variant="ghost"
            @click="replying = false"
          />
        </div>
      </div>
      <div v-else class="flex gap-2">
        <UButton
          label="Reply"
          size="sm"
          color="neutral"
          variant="outline"
          @click="startReply"
        />
        <UButton
          label="Resolve"
          icon="i-mdi-check"
          size="sm"
          color="neutral"
          variant="ghost"
          @click="emit('resolve')"
        />
      </div>
    </template>
  </article>
</template>
