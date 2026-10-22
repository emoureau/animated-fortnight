import type { Locator } from '#shared/types/citation'

/** A place in a record picked in the viewer ("Note from selection"); the notes column writes the note. */
export interface BinSelection { recordId: string, locator: Locator }

export function useBinSelection() {
  return useState<BinSelection | null>('bin-selection', () => null)
}
