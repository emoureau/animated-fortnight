export default defineEventHandler((event) => {
  const folder = findOr404(db.folders, getRouterParam(event, 'id'), 'Folder')
  return folder.recordIds.map(id => findOr404(db.records, id, 'Record'))
})
