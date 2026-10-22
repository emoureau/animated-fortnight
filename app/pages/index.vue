<script setup lang="ts">
import type { Project } from '#shared/types/user'

useHead({ title: 'Projects' })

const { data: projects } = await useFetch<Project[]>('/api/projects', { key: 'projects', default: () => [] })
const { byId } = useUsers()
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-10 flex flex-col gap-6">
    <h1 class="text-3xl font-semibold text-highlighted">
      Projects
    </h1>
    <ul class="flex flex-col gap-3">
      <li v-for="project in projects" :key="project.id">
        <NuxtLink
          :to="`/p/${project.id}`"
          class="group flex items-start gap-4 rounded-lg border border-default bg-elevated p-4 hover:bg-accented"
        >
          <span class="flex size-10 shrink-0 items-center justify-center rounded-md bg-accented group-hover:bg-elevated font-mono text-sm font-semibold text-toned" aria-hidden="true">
            {{ project.shortCode }}
          </span>
          <span class="flex flex-1 flex-col gap-1 min-w-0">
            <span class="font-semibold text-highlighted">{{ project.name }}</span>
            <span class="text-toned">{{ project.description }}</span>
            <span class="text-xs text-muted group-hover:text-toned">
              {{ project.memberIds.length }} members · Updated {{ formatDate(project.updatedAt) }}
            </span>
          </span>
          <UAvatarGroup size="md">
            <PersonAvatar
              v-for="id in project.memberIds.filter(id => byId.has(id))"
              :key="id"
              :user="byId.get(id)!"
            />
          </UAvatarGroup>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
