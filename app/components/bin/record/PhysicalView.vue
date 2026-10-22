<script setup lang="ts">
import type { CatalogRecord, PhysicalAvailability } from '#shared/types/record'

// Physical item (spec 02): where it is, and retrieval status or Request retrieval.
const props = defineProps<{
  record: CatalogRecord
  availability: PhysicalAvailability
}>()

const toast = useToast()
const { byId } = useUsers()
const { requestRetrieval } = useRecordActions()
const requesting = ref(false)

async function request() {
  requesting.value = true
  try {
    await requestRetrieval(props.record.id)
    toast.add({ title: 'Retrieval requested', description: props.availability.location, icon: 'i-mdi-check-circle-outline', color: 'success' })
  }
  finally {
    requesting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <section class="flex flex-col gap-3 rounded-lg border border-default bg-elevated p-4">
      <div class="flex items-start gap-4">
        <RecordTypeTile :record="record" />
        <div class="flex flex-col gap-1 text-sm">
          <h3 class="font-semibold text-highlighted">
            This is a physical item
          </h3>
          <p class="flex items-center gap-1.5 text-toned">
            <UIcon name="i-mdi-map-marker-outline" class="size-4" aria-hidden="true" />
            {{ availability.location }}
          </p>
        </div>
      </div>
      <p v-if="availability.retrieval" class="flex items-center gap-1.5 text-sm text-toned" role="status">
        <UIcon name="i-mdi-clock-outline" class="size-4" aria-hidden="true" />
        Retrieval {{ availability.retrieval.status }} by {{ byId.get(availability.retrieval.requestedBy)?.isCurrentUser ? 'you' : byId.get(availability.retrieval.requestedBy)?.name }} · {{ formatShortDate(availability.retrieval.requestedAt) }}
      </p>
      <div v-else>
        <UButton
          icon="i-mdi-package-variant-closed"
          label="Request retrieval"
          :loading="requesting"
          @click="request"
        />
      </div>
    </section>
    <BinRecordDescription :record="record" :facts="[{ term: 'Location', value: availability.location }]" />
  </div>
</template>
