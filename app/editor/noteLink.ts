import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import NoteLinkNodeView from '~/components/note/nodes/NoteLinkNodeView.vue'

/** Obsidian-style link to another note. Markdown: `[[Note title]]`. Round-trips; `[[` typed in the editor cites instead. */
export const NoteLink = Node.create({
  name: 'noteLink',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return { title: { default: '' } }
  },

  parseHTML() {
    return [{ tag: 'span[data-note-link]', getAttrs: el => ({ title: el.getAttribute('data-note-link') }) }]
  },

  renderHTML({ node }) {
    return ['span', { 'data-note-link': node.attrs.title }]
  },

  addNodeView() {
    return VueNodeViewRenderer(NoteLinkNodeView)
  },

  markdownTokenizer: {
    name: 'noteLink',
    level: 'inline',
    start: src => src.indexOf('[['),
    tokenize: (src) => {
      const match = /^\[\[([^\]]+)\]\]/.exec(src)
      return match ? { type: 'noteLink', raw: match[0], title: match[1] } : undefined
    },
  },

  parseMarkdown: token => ({ type: 'noteLink', attrs: { title: token.title } }),

  renderMarkdown: node => `[[${node.attrs?.title}]]`,
})
