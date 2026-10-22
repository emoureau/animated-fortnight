<script setup lang="ts">
import type { Citation } from '#shared/types/citation'
import type { CatalogRecord, ExternalAvailability } from '#shared/types/record'

const props = defineProps<{
  record: CatalogRecord
  availability: ExternalAvailability
  citation: Citation
}>()

const toast = useToast()
const broken = computed(() => props.availability.linkStatus === 'broken')
const snapshotAt = computed(() => props.citation.snapshotAt ?? props.availability.snapshotAt)

function viewSnapshot() {
  toast.add({ title: 'No snapshot in the prototype', description: 'Saved page copies aren’t part of the mock data.', icon: 'i-mdi-information-outline', color: 'info' })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1.5 rounded-lg border border-default bg-default p-3 text-sm">
      <p class="font-mono">
        {{ availability.domain }}
      </p>
      <p v-if="broken" class="flex items-center gap-1.5 text-warning">
        <UIcon name="i-mdi-alert-outline" class="size-4" aria-hidden="true" />
        Link broken<template v-if="availability.brokenSince">
          since {{ formatShortDate(availability.brokenSince) }}
        </template>
      </p>
      <p v-else class="flex items-center gap-1.5 text-success">
        <UIcon name="i-mdi-check-circle-outline" class="size-4" aria-hidden="true" />
        Link working · checked {{ formatShortDate(availability.linkCheckedAt) }}
      </p>
      <p class="text-muted">
        {{ snapshotAt ? `Snapshot saved ${formatShortDate(snapshotAt)}${citation.snapshotAt ? ' · this citation points at it' : ''}` : 'No snapshot saved' }}
      </p>
    </div>

    <!-- A broken link leads with the snapshot -->
    <div class="grid grid-cols-2 gap-2">
      <UButton
        :to="availability.url"
        target="_blank"
        icon="i-mdi-open-in-new"
        label="Open site"
        :color="broken ? 'neutral' : 'primary'"
        :variant="broken ? 'outline' : 'solid'"
        block
        :class="broken ? 'order-2' : undefined"
      />
      <UButton
        v-if="snapshotAt"
        icon="i-mdi-history"
        label="View snapshot"
        :color="broken ? 'primary' : 'neutral'"
        :variant="broken ? 'solid' : 'outline'"
        block
        :class="broken ? 'order-1' : undefined"
        @click="viewSnapshot"
      />
    </div>

    <RecordPanelCitedAt :locator="citation.locator" />
  </div>
</template>
