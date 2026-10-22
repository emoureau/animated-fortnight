/** "Oct 21, 2026" */
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** "Sep 30" */
export function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** "5 min", "3 h", "Oct 12": compact age for comments. */
export function formatAge(iso: string, now = Date.now()) {
  const minutes = Math.round((now - new Date(iso).getTime()) / 60000)
  if (minutes < 1)
    return 'just now'
  if (minutes < 60)
    return `${minutes} min`
  if (minutes < 24 * 60)
    return `${Math.round(minutes / 60)} h`
  return formatShortDate(iso)
}
