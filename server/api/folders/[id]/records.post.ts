// Add a record to a bin folder (omnisearch "Add to bin").
export default defineEventHandler(async (event) => {
  const folder = findOr404(db.folders, getRouterParam(event, 'id'), 'Folder')
  const { recordId } = await readBody<{ recordId: string }>(event)
  const record = findOr404(db.records, recordId, 'Record')
  if (!folder.recordIds.includes(record.id))
    folder.recordIds.push(record.id)
  return folder
})
