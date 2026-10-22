<script setup lang="ts">
import type { CatalogRecord, ExternalAvailability } from '#shared/types/record'

// External site (spec 02): link status, snapshot, Open site, View snapshot. A broken link leads with the snapshot.
const props = defineProps<{
  record: CatalogRecord
  availability: ExternalAvailability
}>()

const broken = computed(() => props.availability.linkStatus === 'broken')
const viewing = ref(false)
const snapshotLabel = computed(() => props.availability.snapshotAt ? `Snapshot · ${formatShortDate(props.availability.snapshotAt)}` : '')
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <section class="flex flex-col gap-3 rounded-lg border border-default bg-elevated p-4">
      <p class="font-mono text-sm">
        {{ availability.domain }}
      </p>
      <p v-if="broken" class="flex items-center gap-1.5 text-sm text-warning">
        <UIcon name="i-mdi-alert-outline" class="size-4" aria-hidden="true" />
        Link broken<template v-if="availability.brokenSince">
          since {{ formatShortDate(availability.brokenSince) }}
        </template> · use the saved snapshot
      </p>
      <p v-else class="flex items-center gap-1.5 text-sm text-success">
        <UIcon name="i-mdi-check-circle-outline" class="size-4" aria-hidden="true" />
        Link working · checked {{ formatShortDate(availability.linkCheckedAt) }}
      </p>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-if="availability.snapshotAt"
          icon="i-mdi-history"
          label="View snapshot"
          :color="broken ? 'primary' : 'neutral'"
          :variant="broken ? 'solid' : 'outline'"
          :class="broken ? 'order-first' : 'order-last'"
          @click="viewing = true"
        />
        <UButton
          :to="availability.url"
          target="_blank"
          icon="i-mdi-open-in-new"
          label="Open site"
          :color="broken ? 'neutral' : 'primary'"
          :variant="broken ? 'outline' : 'solid'"
        />
      </div>
    </section>

    <BinRecordSnapshotStandIn v-if="availability.snapshotAt" :domain="availability.domain" :label="`${snapshotLabel} · stand-in preview`" />
    <p v-else class="flex items-center gap-1.5 text-sm text-warning">
      <UIcon name="i-mdi-alert-outline" class="size-4" aria-hidden="true" />
      No snapshot saved yet
    </p>

    <BinRecordDescription :record="record" :facts="[{ term: 'Site', value: availability.domain }]" />

    <UModal v-model:open="viewing" :title="snapshotLabel" :description="`Saved copy of ${availability.url}. A stand-in: the prototype has no real snapshots.`">
      <template #body>
        <BinRecordSnapshotStandIn :domain="availability.domain" :label="snapshotLabel" />
      </template>
    </UModal>
  </div>
</template>
