import type { Node as PMNode } from '@tiptap/pm/model'
import type { EditorState } from '@tiptap/pm/state'
import type { Editor } from '@tiptap/vue-3'
import type { DataColor } from '#shared/types/user'
import type { TextRange } from './findText'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { personClasses } from '~/utils/people'
import { findTextRange } from './findText'

// Faked collaboration (spec 01): teammates' carets and selections from presence.json, and
// comment anchors with a margin marker. Everything is found by text, so it follows edits.

export interface CollabPerson { name: string, color: DataColor }

export interface CollabData {
  presence: { person: CollabPerson, cursorAfterText?: string, selectionText?: string }[]
  comments: { id: string, anchorText: string, anchorIndex: number, author: CollabPerson, preview: string }[]
  activeCommentId: string | null
}

interface CollabPluginState {
  data: CollabData
  decorations: DecorationSet
  commentRanges: (TextRange & { id: string })[]
}

export const collabKey = new PluginKey<CollabPluginState>('collab')

const EMPTY: CollabData = { presence: [], comments: [], activeCommentId: null }

// mdi comment-outline; widgets are plain DOM, so no UIcon here.
const COMMENT_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M9 22a1 1 0 0 1-1-1v-3H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6.1l-3.7 3.71c-.2.19-.45.29-.7.29zm1-6v3.08L13.08 16H20V4H4v12z"/></svg>'

function nameFlag(person: CollabPerson) {
  const flag = document.createElement('span')
  flag.className = `pointer-events-none absolute bottom-full left-[-2px] mb-px whitespace-nowrap rounded-sm px-1 text-[11px] leading-4 font-semibold not-italic text-data-label ${personClasses[person.color].fill}`
  flag.textContent = person.name
  return flag
}

function caret(person: CollabPerson) {
  const el = document.createElement('span')
  el.className = `pointer-events-none relative inline-block w-0 h-[1.15em] align-[-0.2em] border-l-2 ${personClasses[person.color].border}`
  el.setAttribute('aria-hidden', 'true')
  el.contentEditable = 'false'
  el.append(nameFlag(person))
  return el
}

function selectionFlag(person: CollabPerson) {
  const el = document.createElement('span')
  el.className = 'pointer-events-none relative inline-block w-0'
  el.setAttribute('aria-hidden', 'true')
  el.contentEditable = 'false'
  el.append(nameFlag(person))
  return el
}

// In the right gutter, outside the 70ch column, level with the anchor's line.
function commentMarker(comment: CollabData['comments'][number], onOpen: (id: string) => void) {
  const wrap = document.createElement('span')
  wrap.contentEditable = 'false'
  const button = document.createElement('button')
  button.type = 'button'
  button.className = `absolute -right-10 mt-1 flex size-7 items-center justify-center rounded-md border border-default bg-elevated hover:bg-accented focus-visible:outline-2 focus-visible:outline-primary ${personClasses[comment.author.color].text}`
  button.setAttribute('aria-label', `Comment by ${comment.author.name}: ${comment.preview}`)
  button.innerHTML = COMMENT_ICON
  // Keep the editor's selection; open the thread on click.
  button.addEventListener('mousedown', e => e.preventDefault())
  button.addEventListener('click', () => onOpen(comment.id))
  wrap.append(button)
  return wrap
}

function build(doc: PMNode, data: CollabData, onOpenComment: (id: string) => void) {
  const decorations: Decoration[] = []
  const commentRanges: CollabPluginState['commentRanges'] = []

  for (const { person, cursorAfterText, selectionText } of data.presence) {
    const after = cursorAfterText ? findTextRange(doc, cursorAfterText) : null
    if (after)
      decorations.push(Decoration.widget(after.to, () => caret(person), { side: 1, key: `caret-${person.name}`, ignoreSelection: true }))
    const selected = selectionText ? findTextRange(doc, selectionText) : null
    if (selected) {
      decorations.push(Decoration.inline(selected.from, selected.to, { class: `${personClasses[person.color].tint} rounded-xs` }))
      decorations.push(Decoration.widget(selected.from, () => selectionFlag(person), { side: -1, key: `sel-${person.name}`, ignoreSelection: true }))
    }
  }

  for (const comment of data.comments) {
    const range = findTextRange(doc, comment.anchorText, comment.anchorIndex)
    if (!range)
      continue
    commentRanges.push({ ...range, id: comment.id })
    const active = comment.id === data.activeCommentId
    decorations.push(Decoration.inline(range.from, range.to, {
      'class': `underline decoration-dotted decoration-2 underline-offset-4 ${personClasses[comment.author.color].underline}${active ? ' bg-elevated' : ''}`,
      'data-comment-id': comment.id,
    }))
    decorations.push(Decoration.widget(range.to, () => commentMarker(comment, onOpenComment), { side: 1, key: `marker-${comment.id}`, ignoreSelection: true }))
  }

  return { decorations: DecorationSet.create(doc, decorations), commentRanges }
}

export const CollabDecorations = Extension.create<{ onOpenComment: (id: string) => void }>({
  name: 'collabDecorations',

  addOptions() {
    return { onOpenComment: () => {} }
  },

  addProseMirrorPlugins() {
    const { onOpenComment } = this.options
    return [
      new Plugin<CollabPluginState>({
        key: collabKey,
        state: {
          init: (_, state) => ({ data: EMPTY, ...build(state.doc, EMPTY, onOpenComment) }),
          apply(tr, value, _old, state) {
            const data = tr.getMeta(collabKey) as CollabData | undefined
            if (!data && !tr.docChanged)
              return value
            const next = data ?? value.data
            return { data: next, ...build(state.doc, next, onOpenComment) }
          },
        },
        props: {
          decorations: state => collabKey.getState(state)?.decorations,
        },
      }),
    ]
  },
})

export function setCollabData(editor: Editor, data: CollabData) {
  editor.view.dispatch(editor.state.tr.setMeta(collabKey, data))
}

/** The open comment whose anchor contains the position, if any. */
export function commentAt(state: EditorState, pos: number) {
  return collabKey.getState(state)?.commentRanges.find(r => pos >= r.from && pos <= r.to)?.id ?? null
}
