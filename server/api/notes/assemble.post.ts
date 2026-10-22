import type { Citation } from '#shared/types/citation'
import type { Note } from '#shared/types/note'
import { citationOrder, parseNoteBody } from '#shared/utils/note-body'

interface AssembleBody {
  projectId: string
  recordNoteIds: string[]
  target: { noteId: string } | { title: string }
}

/**
 * The bridge from Concept B to Concept A (spec 02): each selected record note becomes a paragraph
 * followed by a citation chip built from its locked locator, in a new or an existing shared note.
 */
export default defineEventHandler(async (event) => {
  const { projectId, recordNoteIds, target } = await readBody<AssembleBody>(event)
  const project = findOr404(db.projects, projectId, 'Project')
  if (!recordNoteIds?.length)
    throw createError({ statusCode: 400, statusMessage: 'Select at least one note' })
  const recordNotes = recordNoteIds.map(id => findOr404(db.recordNotes, id, 'Record note'))
  if (recordNotes.some(n => n.projectId !== project.id))
    throw createError({ statusCode: 400, statusMessage: 'Notes must come from this project' })
  if (!target || ('title' in target && !target.title?.trim()))
    throw createError({ statusCode: 400, statusMessage: 'Name the new note' })

  const me = db.users.find(u => u.isCurrentUser)!
  const now = new Date().toISOString()

  const paragraphs = recordNotes.map((recordNote) => {
    const citation: Citation = {
      id: newId('cit'),
      recordId: recordNote.recordId,
      locator: recordNote.locator,
      ...recordNote.snippetIds?.length && { snippetIds: recordNote.snippetIds },
      createdBy: me.id,
    }
    db.citations.push(citation)
    return `${recordNote.body.trim()} [@${citation.id}]`
  }).join('\n\n')

  let note: Note
  if ('noteId' in target) {
    note = findOr404(db.notes, target.noteId, 'Note')
    if (note.projectId !== project.id)
      throw createError({ statusCode: 400, statusMessage: 'The note must be in this project' })
    note.body = `${note.body.trimEnd()}\n\n${paragraphs}\n`
    note.editorIds = [...new Set([...note.editorIds, me.id])]
  }
  else {
    note = {
      id: newId('n'),
      projectId: project.id,
      folder: null,
      title: target.title.trim(),
      format: 'markdown-with-citations',
      body: `# ${target.title.trim()}\n\n${paragraphs}\n`,
      citationIds: [],
      editorIds: [me.id],
      tags: ['draft'],
      createdAt: now,
      updatedAt: now,
      updatedBy: me.id,
    }
    db.notes.push(note)
  }
  note.citationIds = citationOrder(parseNoteBody(note.body))
  note.updatedAt = now
  note.updatedBy = me.id

  for (const recordNote of recordNotes) {
    if (!recordNote.usedInNoteIds.includes(note.id))
      recordNote.usedInNoteIds.push(note.id)
  }
  return note
})
