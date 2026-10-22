<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import type { Project } from '#shared/types/user'

const route = useRoute()
const toast = useToast()
const { show: showSearch } = useOmniSearch()
const { byId, currentUser } = useUsers()

const { data: projects } = useFetch<Project[]>('/api/projects', { key: 'projects', default: () => [] })

const projectId = computed(() => 'projectId' in route.params ? String(route.params.projectId) : undefined)
const project = computed(() => projects.value.find(p => p.id === projectId.value))
const view = computed<'notes' | 'bin' | undefined>(() => {
  if ('noteId' in route.params)
    return 'notes'
  if (route.path.startsWith(`/p/${projectId.value}/bin`))
    return 'bin'
  return undefined
})

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = [{ label: 'Projects', to: '/' }]
  if (project.value)
    items.push({ label: project.value.name, to: `/p/${project.value.id}` })
  if (view.value)
    items.push({ label: view.value === 'notes' ? 'Notes' : 'Bin' })
  if (route.path.startsWith('/records/'))
    items.push({ label: 'Catalog record' })
  return items
})

// Members present: on a note you're in it too, so you show last (as in the A1 reference).
const present = computed(() => {
  if (!project.value)
    return []
  const others = project.value.memberIds.map(id => byId.value.get(id)).filter(u => u && !u.isCurrentUser)
  const people = view.value === 'notes' && currentUser.value ? [...others, currentUser.value] : others
  return people.filter(u => !!u)
})

function share() {
  toast.add({ title: 'Sharing isn’t part of this prototype', icon: 'i-mdi-information-outline', color: 'info' })
}

const isMac = ref(true)
onMounted(() => {
  isMac.value = /Mac|iPhone|iPad/.test(navigator.platform)
})
</script>

<template>
  <header class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 border-b border-default bg-default">
    <NuxtLink to="/" class="flex items-center gap-2.5 rounded-md" aria-label="GRANITE, all projects">
      <span class="block size-7 rounded-md bg-logo" aria-hidden="true" />
      <span class="font-semibold text-highlighted">GRANITE</span>
    </NuxtLink>

    <UBreadcrumb :items="breadcrumbs" separator-icon="i-mdi-slash-forward" />

    <ShellConceptSwitcher v-if="project && view" :project-id="project.id" :current="view" />

    <UButton
      color="neutral"
      variant="subtle"
      icon="i-mdi-magnify"
      class="ms-auto flex-[1_1_320px] max-w-140 h-9 text-muted font-normal"
      aria-keyshortcuts="Meta+K"
      @click="showSearch()"
    >
      <span class="flex-1 text-start truncate">Search projects, notes and the catalog</span>
      <span class="flex gap-0.5">
        <UKbd :value="isMac ? 'meta' : 'ctrl'" />
        <UKbd value="K" />
      </span>
    </UButton>

    <div class="ms-auto flex items-center gap-3">
      <ShellPresenceAvatars v-if="present.length" :people="present" />
      <UButton
        v-if="view === 'notes'"
        icon="i-mdi-account-multiple-outline"
        label="Share"
        @click="share"
      />
    </div>
  </header>
</template>
