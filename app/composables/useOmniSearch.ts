export type OmniSearchMode = 'search' | 'add-to-bin'

/** Open state of the omnisearch palette. "add-to-bin" leads with the Add to bin action (Concept B). */
export function useOmniSearch() {
  const open = useState('omnisearch-open', () => false)
  const mode = useState<OmniSearchMode>('omnisearch-mode', () => 'search')

  function show(nextMode: OmniSearchMode = 'search') {
    mode.value = nextMode
    open.value = true
  }

  return { open, mode, show }
}
