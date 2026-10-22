<script setup lang="ts">
// Comments tab: a new comment on the selection, open threads, then resolved ones (spec 01).
const { comments } = useNoteContext()
const { open, resolved, draft, create, reply, resolve } = comments
</script>

<template>
  <div class="flex flex-col gap-3">
    <CommentComposer
      v-if="draft"
      :draft="draft"
      @submit="create"
      @cancel="draft = null"
    />

    <p v-if="!open.length && !draft" class="text-sm text-muted">
      No open comments. Select text in the note and choose Comment to start one.
    </p>
    <CommentThread
      v-for="comment in open"
      :key="comment.id"
      :comment="comment"
      @reply="reply(comment.id, $event)"
      @resolve="resolve(comment.id)"
    />

    <UCollapsible v-if="resolved.length" class="flex flex-col gap-2">
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        trailing-icon="i-mdi-chevron-down"
        :label="`Resolved · ${resolved.length}`"
        class="self-start"
      />
      <template #content>
        <div class="flex flex-col gap-3">
          <CommentThread v-for="comment in resolved" :key="comment.id" :comment="comment" />
        </div>
      </template>
    </UCollapsible>
  </div>
</template>
