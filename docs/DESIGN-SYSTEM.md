# CulinaSync Design System

Shared visual language for the web app: tokens in `@domain/ui/tokens.css`, primitives in `apps/web/src/components/ui/`, and utility classes in `apps/web/src/index.css`.

## Tokens

| Token | Purpose |
|-------|---------|
| `--color-accent-*` | Brand accent; runtime override via `applyAccentTheme()` |
| `--radius-sm` … `--radius-2xl` | Corner radii |
| `--motion-fast/base/slow` | Transition durations |
| `--ease-out-expo`, `--ease-spring` | Easing curves |
| `--focus-ring` | Accessible focus outline |
| `--settings-density-scale` | Compact density (settings) |

## Glass tiers

| Class | Use |
|-------|-----|
| `glass-panel` | Sidebars, sections |
| `glass-panel-strong` | Sticky header |
| `glass-card` | List cards, tiles |
| `glass-modal` | Dialog surfaces |
| `glass-overlay` | Modal backdrop |
| `glass-hud` | Floating HUD / toasts |

On mobile and `@supports not (backdrop-filter)`, blur is reduced or removed for performance and fallback.

## UI kit (`components/ui`)

| Component | Notes |
|-----------|--------|
| `Button` | `primary`, `secondary`, `ghost`, `destructive`, `accent-soft` |
| `IconButton` | Requires `label` for a11y |
| `Input` / `Textarea` / `Select` | Uses `.ui-input`, `.ui-label`, hints/errors |
| `Card` | `default`, `interactive`, `muted` |
| `Modal` | Focus trap, Escape, `useModalA11y`, optional `initialFocusRef` |
| `Switch` | Settings toggles |
| `Badge` | Status chips |
| `Spinner` | Loading states |
| `PageHeader` | Page title + actions |
| `Skeleton` | Loading placeholders |

Import from `./ui` or `components/ui`.

## Motion & density

- `html.reduced-motion` — disables animations (settings)
- `html.compact-density` — tighter spacing
- `.ui-stagger` — staggered list entrance
- `.interactive-lift` — subtle hover lift on cards

## Shell

- **Accent:** `useAccentTheme()` in `App.tsx` applies palette app-wide
- **Nav:** `config/mainNav.ts` — single source for `Header` and `BottomNav`
- **Skip link:** `.ui-skip-link` in `App.tsx`

## Migration checklist

When touching a screen:

1. Replace ad-hoc modals with `<Modal open onClose title footer>`.
2. Replace raw `<input className="bg-zinc-700…">` with `<Input label />`.
3. Use `<Button variant>` for actions.
4. Use `<PageHeader>` on feature pages.
5. Wrap lists in `.ui-stagger` where appropriate.

## Constraints

- Modals must use `useModalA11y` (built into `Modal`).
- All visible strings via `t()` / locale files.
- No API keys or env-based theme secrets in CSS.
