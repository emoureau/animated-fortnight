import type { BinFolder, RecordNote } from '../../shared/types/bin'
import type { Citation, Snippet } from '../../shared/types/citation'
import type { Comment, Note, Presence } from '../../shared/types/note'
import type { CatalogRecord } from '../../shared/types/record'
import type { SearchResults } from '../../shared/types/search'
import type { Project, User } from '../../shared/types/user'
import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

await setup({ rootDir: fileURLToPath(new URL('../..', import.meta.url)), server: true })

const hasKeys = (obj: object, keys: string[]) => expect(Object.keys(obj)).toEqual(expect.arrayContaining(keys))

describe('shell routes', () => {
  it('users', async () => {
    const users = await $fetch<User[]>('/api/users')
    expect(users).toHaveLength(4)
    expect(users.filter(u => u.isCurrentUser)).toHaveLength(1)
    users.forEach(u => expect(u.dataColor).toMatch(/^person-[1-4]$/))
  })

  it('projects', async () => {
    const projects = await $fetch<Project[]>('/api/projects')
    expect(projects).toHaveLength(3)
    hasKeys(await $fetch<Project>('/api/projects/p_harlow'), ['id', 'name', 'shortCode', 'memberIds'])
    const notes = await $fetch<Note[]>('/api/projects/p_harlow/notes')
    expect(notes.map(n => n.id)).toContain('n_drivers')
  })

  it('search returns the three groups', async () => {
    const res = await $fetch<SearchResults>('/api/search', { query: { q: 'nautical' } })
    hasKeys(res, ['projects', 'notes', 'records'])
    expect(res.records.length).toBeGreaterThan(0)
    const byId = await $fetch<SearchResults>('/api/search', { query: { q: 'cat-1978-02231' } })
    expect(byId.records.map(r => r.catalogId)).toContain('CAT-1978-02231')
    expect(await $fetch<SearchResults>('/api/search')).toEqual({ projects: [], notes: [], records: [] })
  })

  it('presence', async () => {
    const presence = await $fetch<Presence[]>('/api/presence', { query: { noteId: 'n_drivers' } })
    expect(presence).toHaveLength(2)
  })

  it('unknown ids are 404', async () => {
    await expect($fetch('/api/records/nope')).rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('records', () => {
  it('follow the 80% rule: 6 inline, 14 download, 5 external, 3 physical', async () => {
    const records = await $fetch<CatalogRecord[]>('/api/records')
    const count = (mode: string) => records.filter(r => r.availability.mode === mode).length
    expect([count('inline'), count('download'), count('external'), count('physical')]).toEqual([6, 14, 5, 3])
    records.forEach(r => hasKeys(r, ['id', 'catalogId', 'title', 'type', 'availability']))
  })

  it('record, notes and snippets', async () => {
    hasKeys(await $fetch<CatalogRecord>('/api/records/r_stormreport1991'), ['catalogId'])
    const notes = await $fetch<RecordNote[]>('/api/records/r_stormreport1991/notes')
    expect(notes.length).toBeGreaterThan(0)
    notes.forEach(n => expect(n.locator.label).toBeTruthy())
    const snippets = await $fetch<Snippet[]>('/api/records/r_shoreline/snippets')
    snippets.forEach(s => hasKeys(s, ['kind', 'caption', 'createdBy']))
  })

  it('requests retrieval of physical items only', async () => {
    const record = await $fetch<CatalogRecord>('/api/records/r_cores/retrieval', { method: 'POST' })
    expect(record.availability).toMatchObject({ mode: 'physical', retrieval: { status: 'requested', requestedBy: 'u_you' } })
    await expect($fetch('/api/records/r_margin1987/retrieval', { method: 'POST' })).rejects.toMatchObject({ statusCode: 400 })
  })

  it('a record note needs a locator', async () => {
    await expect($fetch('/api/records/r_shoreline/notes', { method: 'POST', body: { projectId: 'p_harlow', body: 'x' } }))
      .rejects
      .toMatchObject({ statusCode: 400 })
    const saved = await $fetch<RecordNote>('/api/records/r_shoreline/notes', {
      method: 'POST',
      body: { projectId: 'p_harlow', body: 'x', locator: { kind: 'whole', label: 'Whole record' } },
    })
    expect(saved.id).toMatch(/^rn_/)
    await expect($fetch('/api/records/r_shoreline/notes', {
      method: 'POST',
      body: { projectId: 'p_harlow', body: 'x', locator: { kind: 'whole', label: 'Whole record' }, flags: ['urgent'] },
    })).rejects.toMatchObject({ statusCode: 400 })
  })
})

describe('concept A routes', () => {
  it('note, comments and citations', async () => {
    const note = await $fetch<Note>('/api/notes/n_drivers')
    expect(note.body).toContain('[@cit_')
    const comments = await $fetch<Comment[]>('/api/notes/n_drivers/comments')
    expect(comments[0]!.replies).toBeInstanceOf(Array)
    const citations = await $fetch<Citation[]>('/api/citations')
    expect(citations).toHaveLength(9)
  })
})

describe('comment routes', () => {
  it('create, reply and resolve a thread', async () => {
    await expect($fetch('/api/notes/n_prior/comments', { method: 'POST', body: { anchorText: 'x' } }))
      .rejects
      .toMatchObject({ statusCode: 400 })
    const created = await $fetch<Comment>('/api/notes/n_prior/comments', {
      method: 'POST',
      body: { anchorText: 'change rates', anchorIndex: 0, body: 'Which table?' },
    })
    expect(created).toMatchObject({ noteId: 'n_prior', authorId: 'u_you', resolved: false, replies: [] })
    const replied = await $fetch<Comment>(`/api/comments/${created.id}/replies`, { method: 'POST', body: { body: 'Table 3.' } })
    expect(replied.replies).toHaveLength(1)
    const resolved = await $fetch<Comment>(`/api/comments/${created.id}`, { method: 'PATCH', body: { resolved: true } })
    expect(resolved.resolved).toBe(true)
    const all = await $fetch<Comment[]>('/api/notes/n_prior/comments')
    expect(all.find(c => c.id === created.id)?.resolved).toBe(true)
  })
})

describe('assemble', () => {
  it('creates a new note with a cited paragraph per record note', async () => {
    const note = await $fetch<Note>('/api/notes/assemble', {
      method: 'POST',
      body: { projectId: 'p_harlow', recordNoteIds: ['rn_02', 'rn_04'], target: { title: 'Storm evidence' } },
    })
    expect(note).toMatchObject({ projectId: 'p_harlow', title: 'Storm evidence', tags: ['draft'], editorIds: ['u_you'] })
    expect(note.body.startsWith('# Storm evidence\n\nWorth checking whether that survey happened.')).toBe(true)
    expect(note.citationIds).toHaveLength(2)
    const citations = await $fetch<Citation[]>('/api/citations')
    const [first, second] = note.citationIds.map(id => citations.find(c => c.id === id)!)
    expect(first).toMatchObject({ recordId: 'r_stormreport1991', locator: { kind: 'page', page: 4 } })
    expect(second).toMatchObject({ recordId: 'r_margin1987', locator: { kind: 'file', file: 'line_14.xyz' }, snippetIds: ['snp_line14'] })
    const notes = await $fetch<RecordNote[]>('/api/projects/p_harlow/record-notes')
    expect(notes.find(n => n.id === 'rn_02')!.usedInNoteIds).toContain(note.id)
  })

  it('appends to an existing note', async () => {
    const before = await $fetch<Note>('/api/notes/n_prior')
    const note = await $fetch<Note>('/api/notes/assemble', {
      method: 'POST',
      body: { projectId: 'p_harlow', recordNoteIds: ['rn_06'], target: { noteId: 'n_prior' } },
    })
    expect(note.body.startsWith(before.body.trimEnd())).toBe(true)
    expect(note.citationIds.length).toBe(before.citationIds.length + 1)
  })

  it('rejects empty, foreign and unnamed assemblies', async () => {
    const post = (body: object) => $fetch('/api/notes/assemble', { method: 'POST', body })
    await expect(post({ projectId: 'p_harlow', recordNoteIds: [], target: { title: 'x' } })).rejects.toMatchObject({ statusCode: 400 })
    await expect(post({ projectId: 'p_marsh', recordNoteIds: ['rn_01'], target: { title: 'x' } })).rejects.toMatchObject({ statusCode: 400 })
    await expect(post({ projectId: 'p_harlow', recordNoteIds: ['rn_01'], target: { title: ' ' } })).rejects.toMatchObject({ statusCode: 400 })
  })
})

describe('concept B routes', () => {
  it('creates folders and lists the project record notes', async () => {
    await expect($fetch('/api/projects/p_harlow/folders', { method: 'POST', body: { name: ' ' } }))
      .rejects
      .toMatchObject({ statusCode: 400 })
    const folder = await $fetch<BinFolder>('/api/projects/p_harlow/folders', { method: 'POST', body: { name: 'Sediment' } })
    expect(folder).toMatchObject({ projectId: 'p_harlow', name: 'Sediment', parentId: null, recordIds: [] })
    const notes = await $fetch<RecordNote[]>('/api/projects/p_harlow/record-notes')
    expect(notes.length).toBeGreaterThanOrEqual(7)
    notes.forEach(n => expect(n.projectId).toBe('p_harlow'))
  })

  it('folders and their records', async () => {
    const folders = await $fetch<BinFolder[]>('/api/projects/p_harlow/folders')
    expect(folders.length).toBeGreaterThan(0)
    const records = await $fetch<CatalogRecord[]>(`/api/folders/${folders[0]!.id}/records`)
    expect(records).toHaveLength(folders[0]!.recordIds.length)
  })
})
