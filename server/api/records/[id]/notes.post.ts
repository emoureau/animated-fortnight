import type { RecordNote } from '#shared/types/bin'

const FLAGS: RecordNote['flags'] = ['follow-up']

export default defineEventHandler(async (event) => {
  const record = findOr404(db.records, getRouterParam(event, 'id'), 'Record')
  const body = await readBody<Pick<RecordNote, 'projectId' | 'locator' | 'body' | 'snippetIds'> & Partial<Pick<RecordNote, 'excerpt' | 'flags'>>>(event)
  // The citation is locked into the note, so a note can't be saved without a place in the record.
  if (!body?.locator?.label?.trim())
    throw createError({ statusCode: 400, statusMessage: 'Choose a file or "Whole record"' })
  if (body.flags?.some(flag => !FLAGS.includes(flag)))
    throw createError({ statusCode: 400, statusMessage: `Flags can only be ${FLAGS.join(', ')}` })
  const me = db.users.find(u => u.isCurrentUser)!
  const note: RecordNote = {
    excerpt: null,
    flags: [],
    ...body,
    id: newId('rn'),
    recordId: record.id,
    authorId: me.id,
    createdAt: new Date().toISOString(),
    usedInNoteIds: [],
  }
  db.recordNotes.push(note)
  return note
})
