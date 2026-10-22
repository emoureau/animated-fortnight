<script setup lang="ts">
import type { Citation } from '#shared/types/citation'
import type { CatalogRecord, PhysicalAvailability } from '#shared/types/record'

const props = defineProps<{
  record: CatalogRecord
  availability: PhysicalAvailability
  citation: Citation
}>()

const toast = useToast()
const { byId } = useUsers()
const { requestRetrieval } = useRecordActions()
const retrieval = computed(() => props.availability.retrieval)

async function request() {
  await requestRetrieval(props.record.id)
  toast.add({ title: 'Retrieval requested', description: props.availability.location, icon: 'i-mdi-check-circle-outline', color: 'success' })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1.5 rounded-lg border border-default bg-default p-3 text-sm">
      <p class="flex items-center gap-1.5">
        <UIcon name="i-mdi-map-marker-outline" class="size-4 text-muted" aria-hidden="true" />
        {{ availability.location }}
      </p>
      <p v-if="retrieval" class="flex items-center gap-1.5 text-toned">
        <UIcon name="i-mdi-clock-outline" class="size-4" aria-hidden="true" />
        Retrieval {{ retrieval.status }} by {{ byId.get(retrieval.requestedBy)?.isCurrentUser ? 'you' : (byId.get(retrieval.requestedBy)?.name ?? 'a team member') }} · {{ formatShortDate(retrieval.requestedAt) }}
      </p>
      <p v-if="citation.verified === false" class="flex items-center gap-1.5 text-warning">
        <UIcon name="i-mdi-alert-outline" class="size-4" aria-hidden="true" />
        Not checked against the box yet
      </p>
    </div>
    <UButton
      v-if="!retrieval"
      icon="i-mdi-package-variant-closed"
      label="Request retrieval"
      block
      @click="request"
    />
    <RecordPanelCitedAt :locator="citation.locator" />
  </div>
</template>
