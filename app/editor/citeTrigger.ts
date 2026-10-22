import type { SuggestionProps } from '@tiptap/suggestion'
import { Extension } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import { Suggestion } from '@tiptap/suggestion'

export interface CiteTriggerHandlers {
  onOpen: (props: SuggestionProps) => void
  onUpdate: (props: SuggestionProps) => void
  onClose: () => void
  /** Return true when the popover handled the key */
  onKeyDown: (event: KeyboardEvent) => boolean
}

export const citeTriggerKey = new PluginKey('citeTrigger')

/**
 * Typing `[[` opens the cite popover (spec 01, Citing). The popover is our own Vue component,
 * so the suggestion only reports the query, range and caret position, and forwards keys.
 */
export const CiteTrigger = Extension.create<{ handlers: CiteTriggerHandlers | null }>({
  name: 'citeTrigger',

  addOptions() {
    return { handlers: null }
  },

  addProseMirrorPlugins() {
    const handlers = this.options.handlers
    return [
      Suggestion({
        editor: this.editor,
        pluginKey: citeTriggerKey,
        char: '[[',
        allowSpaces: true,
        allowedPrefixes: null,
        items: () => [],
        render: () => ({
          onStart: props => handlers?.onOpen(props),
          onUpdate: props => handlers?.onUpdate(props),
          onExit: () => handlers?.onClose(),
          onKeyDown: ({ event }) => handlers?.onKeyDown(event) ?? false,
        }),
      }),
    ]
  },
})
