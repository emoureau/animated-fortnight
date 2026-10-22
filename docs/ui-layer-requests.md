# ui-layer requests

Theme changes this prototype needs from ui-layer. The app doesn't restyle Nuxt UI components locally; it records the gap here.

## The theme is vendored for now

So the repo runs from a fresh clone with only `npm install`, the design system's Nuxt UI setup is copied into the app instead of `extends`-ing ui-layer:

- `app/assets/css/main.css`: the setup CSS from `design/design-system-README.md` (ramps, fonts, light and dark roles).
- `app/app.config.ts`: the color mapping and MDI icon mapping from the same README.

**Request:** publish ui-layer to a registry the team can install from, then replace these two files with `extends: ['@nds/ui-layer']`.

## Data color tokens

`app/assets/css/data-colors.css` defines `--ui-data-person-1…4`, `--ui-data-ai`, `--ui-data-highlight` (plus `-text` and outline variants) and their Tailwind utilities (`bg-person-1`, `text-person-1-text`, `bg-highlight`…). Source: `design/data-colors.css`.

**Request:** add these to ui-layer's main.css after its `:root` and `.dark` blocks, then delete the local file.

## Logo color

`--app-logo` / `bg-logo` (the logo cyan `#41bde6`, between aqua-400 and aqua-500) is defined locally for the logo mark. It must never be used elsewhere in the interface.

**Request:** expose the logo color as a brand token in ui-layer.

## Breadcrumb: current page in primary

`UBreadcrumb` renders the current (last, non-link) item in `text-primary`. Primary means "actionable" in this system, and the references show the current crumb in `text-highlighted`.

**Request:** theme the breadcrumb's active, non-link item as `text-highlighted`.

## Tree: selected row matches the sidebar

`UTree` marks the selected row with `before:bg-elevated`. In this system `bg-muted` and `bg-elevated` are the same step (steel-800), so on a sidebar the selection is invisible. docs/design-rules.md says selected rows use `bg-accented`.

**Request:** theme `UTree`'s selected link as `before:bg-accented`. Until then `NoteSidebar.vue` sets it on the current note's item.

## Editor: long-form body typography

`UEditor`'s base theme sets paragraphs to `leading-7` (16/28) and headings to bold. Design rule 6 asks for `body-lg` (18/30) in a 70ch column for long-form notes, and headings are semibold.

**Request:** a long-form variant of the editor theme (18/30 body, 22/30 semibold h2). Until then `NoteEditor.vue` sets it through the `ui` prop.

## Command palette: unnamed listbox

`UCommandPalette` renders its results as Reka's `ListboxContent` (`role="listbox"`) with no accessible name, and offers no prop or `ui` slot to pass `aria-label` or `aria-labelledby` to it. axe reports `aria-input-field-name` (serious) on omnisearch.

**Request:** name the results listbox (for example from the `placeholder` or a new `listboxLabel` prop), or forward attributes to `ListboxContent`. Until then the omnisearch axe check disables only that rule, in `test/e2e/a11y.spec.ts`.
