import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import SnippetNodeView from '~/components/note/nodes/SnippetNodeView.vue'

/** Embedded team snippet figure. Markdown: `![[snippet:snp_id]]` on its own line. */
export const SnippetBlock = Node.create({
  name: 'snippet',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return { snippetId: { default: null } }
  },

  parseHTML() {
    return [{ tag: 'div[data-snippet]', getAttrs: el => ({ snippetId: el.getAttribute('data-snippet') }) }]
  },

  renderHTML({ node }) {
    return ['div', { 'data-snippet': node.attrs.snippetId }]
  },

  addNodeView() {
    return VueNodeViewRenderer(SnippetNodeView)
  },

  markdownTokenizer: {
    name: 'snippet',
    level: 'block',
    start: src => src.indexOf('![[snippet:'),
    tokenize: (src) => {
      const match = /^!\[\[snippet:([\w-]+)\]\][ \t]*(?:\n+|$)/.exec(src)
      return match ? { type: 'snippet', raw: match[0], snippetId: match[1] } : undefined
    },
  },

  parseMarkdown: token => ({ type: 'snippet', attrs: { snippetId: token.snippetId } }),

  renderMarkdown: node => `![[snippet:${node.attrs?.snippetId}]]`,
})
