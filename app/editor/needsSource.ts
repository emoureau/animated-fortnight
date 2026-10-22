import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import NeedsSourceNodeView from '~/components/note/nodes/NeedsSourceNodeView.vue'

const MARKER = '{{needs-source}}'

/** Inline "Needs a source" warning. Markdown: `{{needs-source}}`. */
export const NeedsSource = Node.create({
  name: 'needsSource',
  group: 'inline',
  inline: true,
  atom: true,

  parseHTML() {
    return [{ tag: 'span[data-needs-source]' }]
  },

  renderHTML() {
    return ['span', { 'data-needs-source': '' }]
  },

  addNodeView() {
    return VueNodeViewRenderer(NeedsSourceNodeView)
  },

  markdownTokenizer: {
    name: 'needsSource',
    level: 'inline',
    start: src => src.indexOf(MARKER),
    tokenize: src => src.startsWith(MARKER) ? { type: 'needsSource', raw: MARKER } : undefined,
  },

  parseMarkdown: () => ({ type: 'needsSource' }),

  renderMarkdown: () => MARKER,
})
