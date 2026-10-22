import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import CitationNodeView from '~/components/note/nodes/CitationNodeView.vue'

/** Inline citation chip. Markdown: `[@cit_01]` (docs/domain-model.md). */
export const Citation = Node.create({
  name: 'citation',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return { citationId: { default: null } }
  },

  parseHTML() {
    return [{ tag: 'span[data-citation]', getAttrs: el => ({ citationId: el.getAttribute('data-citation') }) }]
  },

  renderHTML({ node }) {
    return ['span', { 'data-citation': node.attrs.citationId }]
  },

  addNodeView() {
    return VueNodeViewRenderer(CitationNodeView)
  },

  markdownTokenizer: {
    name: 'citation',
    level: 'inline',
    start: src => src.indexOf('[@'),
    tokenize: (src) => {
      const match = /^\[@([\w-]+)\]/.exec(src)
      return match ? { type: 'citation', raw: match[0], citationId: match[1] } : undefined
    },
  },

  parseMarkdown: token => ({ type: 'citation', attrs: { citationId: token.citationId } }),

  renderMarkdown: node => `[@${node.attrs?.citationId}]`,
})
