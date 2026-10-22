import type { Citation, Snippet } from '#shared/types/citation'
import type { Comment, Note } from '#shared/types/note'
import type { AvailabilityMode, CatalogRecord } from '#shared/types/record'
import type { Project } from '#shared/types/user'
import { citationOrder, inlineText, parseNoteBody } from '#shared/utils/note-body'

export interface LinkedMention {
  note: Note
  excerpt: string
}

/** Everything the Concept A note view reads, loaded once per note and derived into lookups. */
export async function useNoteView(projectId: MaybeRefOrGetter<string>, noteId: MaybeRefOrGetter<string>) {
  const [
    { data: note },
    { data: projectNotes },
    { data: citations },
    { data: records },
    { data: snippets },
    { data: comments },
    { data: projects },
  ] = await Promise.all([
    useFetch<Note>(() => `/api/notes/${toValue(noteId)}`),
    useFetch<Note[]>(() => `/api/projects/${toValue(projectId)}/notes`, { default: () => [] }),
    useFetch<Citation[]>('/api/citations', { key: 'citations', default: () => [] }),
    useFetch<CatalogRecord[]>('/api/records', { key: 'records', default: () => [] }),
    useFetch<Snippet[]>('/api/snippets', { query: { projectId }, default: () => [] }),
    useFetch<Comment[]>(() => `/api/notes/${toValue(noteId)}/comments`, { default: () => [] }),
    useFetch<Project[]>('/api/projects', { key: 'projects', default: () => [] }),
  ])

  const project = computed(() => projects.value.find(p => p.id === toValue(projectId)))
  const blocks = computed(() => note.value ? parseNoteBody(note.value.body) : [])
  const citationIds = computed(() => citationOrder(blocks.value))

  const citationById = computed(() => new Map(citations.value.map(c => [c.id, c])))
  const recordById = computed(() => new Map(records.value.map(r => [r.id, r])))
  const snippetById = computed(() => new Map(snippets.value.map(s => [s.id, s])))

  /** Citation plus its record, for every citation in the body, in order of first appearance. */
  const cited = computed(() => citationIds.value.flatMap((id) => {
    const citation = citationById.value.get(id)
    const record = citation && recordById.value.get(citation.recordId)
    return citation && record ? [{ citation, record }] : []
  }))

  const sourceCounts = computed(() => {
    const counts: Record<AvailabilityMode, number> = { inline: 0, download: 0, external: 0, physical: 0 }
    const seen = new Set<string>()
    for (const { record } of cited.value) {
      if (!seen.has(record.id))
        counts[record.availability.mode]++
      seen.add(record.id)
    }
    return counts
  })

  // Obsidian-style: a note links here with [[X]] where X starts this note's title.
  const linkedMentions = computed<LinkedMention[]>(() => {
    const title = note.value?.title
    if (!title)
      return []
    return projectNotes.value.flatMap((other) => {
      if (other.id === toValue(noteId))
        return []
      for (const block of parseNoteBody(other.body)) {
        const lines = block.type === 'list' ? block.items : block.type === 'snippet' ? [] : [block.content]
        const line = lines.find(l => l.some(n => n.type === 'noteLink' && title.startsWith(n.title)))
        if (line)
          return [{ note: other, excerpt: inlineText(line).trim() }]
      }
      return []
    })
  })

  /** Other notes in the project that cite the same record, with how many times. */
  function alsoCitedIn(recordId: string) {
    return projectNotes.value.flatMap((other) => {
      if (other.id === toValue(noteId))
        return []
      const count = other.citationIds.filter(id => citationById.value.get(id)?.recordId === recordId).length
      return count ? [{ note: other, count }] : []
    })
  }

  /** Make a just-created citation available to the chips and References without a refetch. */
  function addCitation(citation: Citation) {
    citations.value = [...citations.value, citation]
  }

  return {
    note,
    projectNotes,
    comments,
    project,
    blocks,
    cited,
    citationById,
    recordById,
    snippetById,
    sourceCounts,
    linkedMentions,
    alsoCitedIn,
    addCitation,
  }
}
