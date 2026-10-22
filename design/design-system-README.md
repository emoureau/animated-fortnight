A dark-first theme, with a matching light mode, for **Nuxt UI 4** on **Tailwind CSS 4**, built for a serious science and technology research site where people read for long stretches and organize material. It keeps Nuxt UI's own token names (`--ui-primary`, `--ui-text-muted`, `--ui-bg-elevated`…), so teams already on Nuxt UI change configuration, not components. Every value is in `tokens.json`; the setup code at the end of this page is generated from the same values.

## Principles

- **Reading comes first.** In dark, body text is a soft off-white on a deep grey canvas with a faint blue cast, never pure white on black; in light, near-black steel-800 on white. Long-form text is capped at `prose-measure` (70ch).
- **Quiet chrome, clear signals.** Neutrals carry the interface; blue marks what is actionable, cyan marks secondary emphasis and information. Status colors appear only where a state is being reported.
- **Elevation by color in the flow, shadow only when floating.** Cards and panels step up through `--ui-bg` → `--ui-bg-muted` / `--ui-bg-elevated`; menus, popovers, drawers and modals add a `shadow-*` token.
- **Faint outlines, firm controls.** Dividers and card edges use the faint `--ui-border`; anything a person operates (inputs, checkboxes, outline buttons) uses `--ui-border-accented`, which meets 3:1.
- **WCAG 2.2 AA everywhere.** Every text pair named below is checked; status is never shown by color alone.

## Color

Every ramp follows Tailwind 4's lightness curve step for step (so Nuxt UI's shade choices behave as designed), with chroma and hue tuned for a calm, professional palette. All chromatic ramps are muted: chroma sits 10% below where it started, which takes the glare off without changing contrast. That 10% muting applies to the azure, aqua and status ramps; steel was desaturated separately.

- **azure** — primary blue. Tailwind's blue lightness, about a quarter less saturated and nudged away from violet (hue 250–258).
- **aqua** — secondary cyan, 30° from azure so the two read as one family. Its hue matches the logo cyan `#41bde6`, which falls between `aqua-400` and `aqua-500` in lightness and is slightly more vivid than the ramp. Keep the logo at its own value; the ramp is for the interface.
- **steel** — a near-neutral grey that keeps just a trace of blue (chroma ≤ 0.015, about a third of Tailwind's slate). Its hue follows azure (252–258), so the greys and the blues read as one family; next to pure grey it looks slightly cool, and on its own it reads as grey.
- Status ramps are Tailwind's emerald, amber and red with the same muting, renamed **jade** (success), **ochre** (warning) and **garnet** (error) so they don't override Tailwind's built-in palettes. **info** shares the aqua ramp.

| Step | azure (primary) | aqua (secondary) | steel (neutral) | jade (success) | ochre (warning) | garnet (error) |
|---|---|---|---|---|---|---|
| 50 | `#f0f6fc` | `#effdfe` | `#f9fafb` | `#edfcf5` | `#fffbec` | `#fef2f2` |
| 100 | `#ddeaf9` | `#d7f7fe` | `#f3f5f6` | `#d3f9e6` | `#fdf3cb` | `#fde3e3` |
| 200 | `#c3dbf6` | `#b6effc` | `#e5e8eb` | `#abf2d1` | `#fbe691` | `#fccbcb` |
| 300 | `#9bc4f4` | `#8be1fa` | `#d0d4d9` | `#6fe7b7` | `#fcd34f` | `#fca5a5` |
| 400 | `#64a4ee` | `#5fcaea` | `#9aa0a8` | `#21d195` | `#fabc00` | `#f86c6d` |
| 500 | `#3188e8` | `#46b2d3` | `#6d737c` | `#00ba81` | `#f69e00` | `#f14142` |
| 600 | `#1a6bd9` | `#328fae` | `#4f555c` | `#009669` | `#da7600` | `#de1f22` |
| 700 | `#1258c4` | `#28728d` | `#3c4148` | `#007857` | `#b45205` | `#b91a1b` |
| 800 | `#0f499e` | `#255d73` | `#25292f` | `#085f46` | `#914110` | `#981d1c` |
| 900 | `#14407d` | `#214d60` | `#14181d` | `#0e4d3b` | `#763614` | `#7d2120` |
| 950 | `#11294b` | `#143241` | `#05070b` | `#052c22` | `#431b06` | `#430d0c` |

### Semantic roles

Dark is the default theme; light is the same system with each role remapped to a darker step so it holds AA on white. Use the role tokens and both themes follow.

#### Dark

- Page canvas `--ui-bg` (steel-900). Sidebars, toolbars and table headers `--ui-bg-muted`; cards, panels and overlays `--ui-bg-elevated` (steel-800); hover and selected rows `--ui-bg-accented` (steel-700).
- Headings and emphasized values `--ui-text-highlighted` (steel-50). Body copy `--ui-text` (steel-200). Secondary copy and table cells `--ui-text-toned` (steel-300). Metadata, captions and placeholders `--ui-text-muted` / `--ui-text-dimmed` (steel-400).
- Labels on any solid color fill use `--ui-text-inverted` (steel-900), never white.
- Links are `--ui-primary` and underlined in running text; color alone does not mark a link.
- On `--ui-bg-accented`, set text in `--ui-text-toned` or brighter, and primary text in `azure-300`: muted, primary and error text fall below 4.5:1 there.
- Two deliberate departures from Nuxt UI's dark defaults, both for contrast: `--ui-text-dimmed` is steel-400 (not 500) so placeholders pass 4.5:1, and `--ui-border-accented` is steel-500 (not 700) so control outlines pass 3:1.

#### Light

- Page canvas `--ui-bg` (white). `--ui-bg-muted` steel-50, `--ui-bg-elevated` steel-100, `--ui-bg-accented` steel-200.
- `--ui-text-highlighted` steel-900, `--ui-text` steel-800, `--ui-text-toned` steel-700, `--ui-text-muted` steel-600, `--ui-text-dimmed` steel-500.
- `--ui-primary` azure-700; `--ui-secondary` and `--ui-info` aqua-800; `--ui-success` jade-800; `--ui-warning` ochre-800; `--ui-error` garnet-700. Labels on solid fills are white (`--ui-text-inverted`).
- Borders: `--ui-border` steel-200, `--ui-border-muted` steel-300, `--ui-border-accented` steel-500 (control outlines).
- Why these differ from Nuxt UI's light defaults: Nuxt's primary at 500 is 3.6:1 on white, and its soft/subtle variants (10% tints) need the colors one or two steps darker still to hold 4.5:1. Muted text and body text sit one step darker than Nuxt so they hold on `--ui-bg-elevated`, and `--ui-border-accented` moves from 300 (1.5:1) to 500.
- `--ui-text-dimmed` (4.4:1 on elevated) is for placeholders only, which sit on the white input ground (4.8:1).

### Contrast — dark (WCAG 2.2)

| Foreground | on `--ui-bg` | on `--ui-bg-elevated` | on `--ui-bg-accented` | soft fill (10% tint on bg) |
|---|---|---|---|---|
| `--ui-text-highlighted` (steel-50) | 17.1:1 | 14.0:1 | 9.8:1 | — |
| `--ui-text` (steel-200) | 14.5:1 | 11.9:1 | 8.4:1 | — |
| `--ui-text-toned` (steel-300) | 12.0:1 | 9.8:1 | 6.9:1 | — |
| `--ui-text-muted / dimmed` (steel-400) | 6.8:1 | 5.5:1 | 3.9:1 | — |
| `--ui-primary` (azure-400) | 6.9:1 | 5.6:1 | 4.0:1 | 5.9:1 · on elevated 4.8:1 |
| `--ui-secondary / info` (aqua-400) | 9.4:1 | 7.7:1 | 5.4:1 | 7.8:1 · on elevated 6.3:1 |
| `--ui-success` (jade-400) | 9.0:1 | 7.4:1 | 5.2:1 | 7.5:1 · on elevated 6.1:1 |
| `--ui-warning` (ochre-400) | 10.4:1 | 8.5:1 | 6.0:1 | 8.6:1 · on elevated 6.9:1 |
| `--ui-error` (garnet-400) | 6.2:1 | 5.1:1 | 3.6:1 | 5.5:1 · on elevated 4.45:1 (below AA; see Alert) |
| `--ui-border-accented (control outline)` (steel-500) | 3.7:1 | 3.1:1 | 2.2:1 | — |

| Fill | Label `--ui-text-inverted` (steel-900) | Hover fill | Label on hover | Nuxt default hover (75%) |
|---|---|---|---|---|
| azure-400 | 6.9:1 | azure-300 | 9.8:1 | 4.4:1 |
| aqua-400 | 9.4:1 | aqua-300 | 12.1:1 | 5.8:1 |
| jade-400 | 9.0:1 | jade-300 | 11.7:1 | 5.6:1 |
| ochre-400 | 10.4:1 | ochre-300 | 12.4:1 | 6.3:1 |
| garnet-400 | 6.2:1 | garnet-300 | 9.4:1 | 4.0:1 |

### Contrast — light (WCAG 2.2)

| Foreground | on `--ui-bg` | on `--ui-bg-elevated` | on `--ui-bg-accented` | soft fill (10% tint on bg) |
|---|---|---|---|---|
| `--ui-text-highlighted` (steel-900) | 17.8:1 | 16.3:1 | 14.5:1 | — |
| `--ui-text` (steel-800) | 14.6:1 | 13.4:1 | 11.9:1 | — |
| `--ui-text-toned` (steel-700) | 10.3:1 | 9.4:1 | 8.4:1 | — |
| `--ui-text-muted` (steel-600) | 7.5:1 | 6.9:1 | 6.1:1 | — |
| `--ui-text-dimmed` (steel-500) | 4.8:1 | 4.4:1 | 3.9:1 | — |
| `--ui-primary` (azure-700) | 6.5:1 | 6.0:1 | 5.3:1 | 5.6:1 · on elevated 5.1:1 |
| `--ui-secondary / info` (aqua-800) | 7.3:1 | 6.6:1 | 5.9:1 | 6.3:1 · on elevated 5.7:1 |
| `--ui-success` (jade-800) | 7.7:1 | 7.0:1 | 6.2:1 | 6.6:1 · on elevated 6.0:1 |
| `--ui-warning` (ochre-800) | 7.1:1 | 6.5:1 | 5.8:1 | 6.1:1 · on elevated 5.6:1 |
| `--ui-error` (garnet-700) | 6.5:1 | 6.0:1 | 5.3:1 | 5.5:1 · on elevated 5.0:1 |
| `--ui-border-accented (control outline)` (steel-500) | 4.8:1 | 4.4:1 | 3.9:1 | — |

| Fill | Label `--ui-text-inverted` (white) | Hover fill | Label on hover | Nuxt default hover (75%) |
|---|---|---|---|---|
| azure-700 | 6.5:1 | azure-800 | 8.5:1 | 3.9:1 |
| aqua-800 | 7.3:1 | aqua-900 | 9.1:1 | 4.0:1 |
| jade-800 | 7.7:1 | jade-900 | 9.8:1 | 4.2:1 |
| ochre-800 | 7.1:1 | ochre-900 | 9.1:1 | 4.0:1 |
| garnet-700 | 6.5:1 | garnet-800 | 8.3:1 | 4.3:1 |

Focus rings use `--ui-primary` (Nuxt UI's default `outline-primary`), solid, 2px, offset 2px: in dark 6.9:1 on the canvas and 5.6:1 on elevated surfaces; in light 6.5:1 and 6.0:1.

### Status

Every alert, badge or inline message pairs its color with an icon and a word ("Error", "Saved", "Review needed"). Success (jade) and error (garnet) are not told apart by hue alone.

## Typography

- One family: **IBM Plex Sans** (`font-sans`), weights 400, 500 and 600. **IBM Plex Mono** (`font-mono`) is for code, identifiers and DOIs. Both load from Google Fonts through Nuxt UI's bundled `@nuxt/fonts` once named in `--font-sans` / `--font-mono`.
- Headings `display`, `h1`–`h4` are semibold (600) in `--ui-text-highlighted`, with slight negative tracking at 30px and above.
- Article and report bodies use `body-lg` (18/30) inside `prose-measure`; app screens use `body` (16/26); controls, tables and navigation use `ui` (14/20), Nuxt UI's default `md` size.
- Use `label` (500) for form labels, buttons and tabs; `caption` for figure captions and footnotes in `--ui-text-muted`.
- Set numeric table columns and identifiers in `data` with `tabular-nums`.
- Sentence case for headings, buttons and labels.

## Spacing, radius and layout

- Tailwind's `--spacing` (0.25rem) drives every utility. Reach for the named steps: `space-2` icon gaps, `space-4` / `space-6` card padding, `space-8` between sections, `space-12` between page regions.
- `--ui-radius` is 0.25rem: buttons and inputs `radius-md` (6px), cards and overlays `radius-lg` (8px), `radius-full` only for avatars, switches and pill tags.
- App pages sit in `UContainer` (`--ui-container`, 80rem). Reading views center a single column at `prose-measure`.

## Elevation, borders and shadows

- In-flow surfaces never take a shadow. Separate them by stepping the background and, where needed, a 1px `--ui-border`.
- Floating surfaces take a shadow and a 1px `--ui-border-muted` ring so their edge holds: `shadow-md` menus, popovers and tooltips; `shadow-lg` slideovers, drawers and toasts; `shadow-xl` modals and the command palette. Each shadow token has a deeper dark value and a softer light value.

## Iconography

- Icons are **Material Design Icons** (Pictogrammers MDI) through Iconify: install `@iconify-json/mdi` and write `i-mdi-<name>` (`<UIcon name="i-mdi-magnify" />`).
- Prefer the `-outline` variants in the interface; reserve filled glyphs for selected or active states.
- Icons sit at 20px beside `ui` text and 24px in toolbars, in `--ui-text-muted` unless they carry state.
- An icon-only button always has an `aria-label`.
- Nuxt UI's built-in icons (Lucide by default) are remapped to MDI in `app.config.ts` below, so component chrome matches the rest of the app.

## Setup in a Nuxt 4 app or layer

```bash
npm i @nuxt/ui tailwindcss @iconify-json/mdi
```

`nuxt.config.ts`

```ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  colorMode: { preference: 'dark', fallback: 'dark' }, // dark by default; light is available via UColorModeButton
  icon: { serverBundle: { collections: ['mdi'] } }
})
```

`app/assets/css/main.css`

```css
@import "tailwindcss";
@import "@nuxt/ui";

@theme static {
  --font-sans: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, monospace;

  --color-azure-50: oklch(97.0% 0.011 250.0);
  --color-azure-100: oklch(93.2% 0.025 250.8);
  --color-azure-200: oklch(88.2% 0.046 251.6);
  --color-azure-300: oklch(80.9% 0.081 252.4);
  --color-azure-400: oklch(70.7% 0.128 253.2);
  --color-azure-500: oklch(62.3% 0.166 254.0);
  --color-azure-600: oklch(54.6% 0.184 258.0);
  --color-azure-700: oklch(48.8% 0.182 259.9);
  --color-azure-800: oklch(42.4% 0.150 259.2);
  --color-azure-900: oklch(37.9% 0.113 257.2);
  --color-azure-950: oklch(28.2% 0.070 258.0);
  --color-aqua-50: oklch(98.4% 0.015 204.1);
  --color-aqua-100: oklch(95.6% 0.035 210.2);
  --color-aqua-200: oklch(91.7% 0.060 214.2);
  --color-aqua-300: oklch(86.5% 0.090 218.0);
  --color-aqua-400: oklch(78.9% 0.108 220.0);
  --color-aqua-500: oklch(71.5% 0.108 222.0);
  --color-aqua-600: oklch(60.9% 0.097 224.0);
  --color-aqua-700: oklch(52.0% 0.083 226.0);
  --color-aqua-800: oklch(45.0% 0.068 228.0);
  --color-aqua-900: oklch(39.8% 0.058 230.0);
  --color-aqua-950: oklch(30.2% 0.045 232.0);
  --color-steel-50: oklch(98.4% 0.0015 252.0);
  --color-steel-100: oklch(96.8% 0.003 252.6);
  --color-steel-200: oklch(92.9% 0.005 253.2);
  --color-steel-300: oklch(86.9% 0.008 253.8);
  --color-steel-400: oklch(70.4% 0.013 254.4);
  --color-steel-500: oklch(55.4% 0.015 255.0);
  --color-steel-600: oklch(44.6% 0.014 255.6);
  --color-steel-700: oklch(37.2% 0.014 256.2);
  --color-steel-800: oklch(27.9% 0.013 256.8);
  --color-steel-900: oklch(20.8% 0.012 257.4);
  --color-steel-950: oklch(12.9% 0.010 258.0);
  --color-jade-50: oklch(97.9% 0.019 166.1);
  --color-jade-100: oklch(95.0% 0.047 163.1);
  --color-jade-200: oklch(90.5% 0.084 164.2);
  --color-jade-300: oklch(84.5% 0.129 165.0);
  --color-jade-400: oklch(76.5% 0.159 163.2);
  --color-jade-500: oklch(69.6% 0.152 162.5);
  --color-jade-600: oklch(59.6% 0.129 163.2);
  --color-jade-700: oklch(50.8% 0.106 165.6);
  --color-jade-800: oklch(43.2% 0.086 166.9);
  --color-jade-900: oklch(37.8% 0.069 168.9);
  --color-jade-950: oklch(26.2% 0.046 172.6);
  --color-ochre-50: oklch(98.7% 0.020 95.3);
  --color-ochre-100: oklch(96.2% 0.053 95.6);
  --color-ochre-200: oklch(92.4% 0.108 95.7);
  --color-ochre-300: oklch(87.9% 0.152 91.6);
  --color-ochre-400: oklch(82.8% 0.170 84.4);
  --color-ochre-500: oklch(76.9% 0.167 70.1);
  --color-ochre-600: oklch(66.6% 0.160 58.3);
  --color-ochre-700: oklch(55.5% 0.147 49.0);
  --color-ochre-800: oklch(47.3% 0.123 46.2);
  --color-ochre-900: oklch(41.4% 0.101 45.9);
  --color-ochre-950: oklch(27.9% 0.069 45.6);
  --color-garnet-50: oklch(97.1% 0.012 17.4);
  --color-garnet-100: oklch(93.6% 0.029 17.7);
  --color-garnet-200: oklch(88.5% 0.056 18.3);
  --color-garnet-300: oklch(80.8% 0.103 19.6);
  --color-garnet-400: oklch(70.4% 0.172 22.2);
  --color-garnet-500: oklch(63.7% 0.213 25.3);
  --color-garnet-600: oklch(57.7% 0.221 27.3);
  --color-garnet-700: oklch(50.5% 0.192 27.5);
  --color-garnet-800: oklch(44.4% 0.159 26.9);
  --color-garnet-900: oklch(39.6% 0.127 25.7);
  --color-garnet-950: oklch(25.8% 0.083 26.0);
}

:root {
  --ui-radius: 0.25rem;
  --ui-container: 80rem;
  --ui-header-height: 4rem;

  /* light mode */
  --ui-primary: var(--ui-color-primary-700);
  --ui-secondary: var(--ui-color-secondary-800);
  --ui-success: var(--ui-color-success-800);
  --ui-info: var(--ui-color-info-800);
  --ui-warning: var(--ui-color-warning-800);
  --ui-error: var(--ui-color-error-700);
  --ui-text-dimmed: var(--ui-color-neutral-500);
  --ui-text-muted: var(--ui-color-neutral-600);
  --ui-text-toned: var(--ui-color-neutral-700);
  --ui-text: var(--ui-color-neutral-800);
  --ui-border-muted: var(--ui-color-neutral-300);
  --ui-border-accented: var(--ui-color-neutral-500);
}

.dark {
  --ui-primary: var(--ui-color-primary-400);
  --ui-secondary: var(--ui-color-secondary-400);
  --ui-success: var(--ui-color-success-400);
  --ui-info: var(--ui-color-info-400);
  --ui-warning: var(--ui-color-warning-400);
  --ui-error: var(--ui-color-error-400);
  --ui-text-muted: var(--ui-color-neutral-400);
  --ui-text-toned: var(--ui-color-neutral-300);
  --ui-text: var(--ui-color-neutral-200);
  --ui-border-muted: var(--ui-color-neutral-700);
  --ui-text-dimmed: var(--ui-color-neutral-400);
  --ui-text-highlighted: var(--ui-color-neutral-50);
  --ui-bg-inverted: var(--ui-color-neutral-50);
  --ui-border-accented: var(--ui-color-neutral-500);
  --ui-border-inverted: var(--ui-color-neutral-50);
}
```

Every other role in both themes is already Nuxt UI's default once the palettes are mapped. The `.dark` block restates the dark values that `:root` changes, so dark mode isn't affected by the light overrides. Shadows: in light mode, use Tailwind's default `shadow-*` utilities or the light values in `tokens.json`. Dark mode uses the deeper values.

`app/app.config.ts`

```ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'azure',
      secondary: 'aqua',
      success: 'jade',
      info: 'aqua',
      warning: 'ochre',
      error: 'garnet',
      neutral: 'steel'
    },
    icons: {
      arrowDown: 'i-mdi-arrow-down',
      arrowLeft: 'i-mdi-arrow-left',
      arrowRight: 'i-mdi-arrow-right',
      arrowUp: 'i-mdi-arrow-up',
      caution: 'i-mdi-alert-octagon-outline',
      check: 'i-mdi-check',
      chevronDoubleLeft: 'i-mdi-chevron-double-left',
      chevronDoubleRight: 'i-mdi-chevron-double-right',
      chevronDown: 'i-mdi-chevron-down',
      chevronLeft: 'i-mdi-chevron-left',
      chevronRight: 'i-mdi-chevron-right',
      chevronUp: 'i-mdi-chevron-up',
      close: 'i-mdi-close',
      copy: 'i-mdi-content-copy',
      copyCheck: 'i-mdi-check-all',
      dark: 'i-mdi-weather-night',
      drag: 'i-mdi-drag-vertical',
      ellipsis: 'i-mdi-dots-horizontal',
      error: 'i-mdi-close-circle-outline',
      external: 'i-mdi-open-in-new',
      eye: 'i-mdi-eye-outline',
      eyeOff: 'i-mdi-eye-off-outline',
      file: 'i-mdi-file-outline',
      folder: 'i-mdi-folder-outline',
      folderOpen: 'i-mdi-folder-open-outline',
      hash: 'i-mdi-pound',
      info: 'i-mdi-information-outline',
      light: 'i-mdi-weather-sunny',
      loading: 'i-mdi-loading',
      menu: 'i-mdi-menu',
      minus: 'i-mdi-minus',
      panelClose: 'i-mdi-arrow-collapse-left',
      panelOpen: 'i-mdi-arrow-expand-right',
      plus: 'i-mdi-plus',
      reload: 'i-mdi-refresh',
      search: 'i-mdi-magnify',
      stop: 'i-mdi-stop',
      success: 'i-mdi-check-circle-outline',
      system: 'i-mdi-monitor',
      tip: 'i-mdi-lightbulb-outline',
      upload: 'i-mdi-upload',
      warning: 'i-mdi-alert-outline'
    }
  }
})
```

