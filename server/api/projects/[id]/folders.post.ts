import type { BinFolder } from '#shared/types/bin'

// New bin folder (spec 02, "New folder").
export default defineEventHandler(async (event) => {
  const project = findOr404(db.projects, getRouterParam(event, 'id'), 'Project')
  const body = await readBody<{ name?: string, parentId?: string | null }>(event)
  const name = body?.name?.trim()
  if (!name)
    throw createError({ statusCode: 400, statusMessage: 'A folder needs a name' })
  if (body.parentId)
    findOr404(db.folders, body.parentId, 'Folder')
  const folder: BinFolder = { id: newId('f'), projectId: project.id, name, parentId: body.parentId ?? null, recordIds: [] }
  db.folders.push(folder)
  return folder
})
