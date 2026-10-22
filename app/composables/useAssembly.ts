/**
 * Record notes chosen for "Assemble notes into draft" (spec 02), in assembly order,
 * and whether the bin is in selection mode (checkboxes on note cards).
 */
export function useAssembly() {
  const selected = useState<string[]>('assembly-selection', () => [])
  const selecting = useState('assembly-selecting', () => false)

  function toggle(noteId: string, on = !selected.value.includes(noteId)) {
    selected.value = on
      ? [...new Set([...selected.value, noteId])]
      : selected.value.filter(id => id !== noteId)
  }

  function clear() {
    selected.value = []
    selecting.value = false
  }

  return { selected, selecting, toggle, clear }
}
