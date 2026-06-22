# Visual Style Improvements

> Owner: duanejevon@gmail.com  ·  Created: 2026-06-22

## Begin (raw)
<!-- 3-minute brain dump. Do not edit or reinterpret. -->
I'd like to make some visual style improvements to the app.

## Refine (scope)
- **Goal**: Restyle the app with a Windows 11 / Fluent-inspired look similar to
  Microsoft To Do: a customizable, faded background image behind
  semi-transparent ("glass") boards/columns, customizable per-board icons, a
  hamburger app menu replacing Electron's native menu bar, and clearer
  visual emphasis on the selected board.
- **In / Out of scope**:
  - In:
    - App-wide background image: small built-in gallery (incl. one
      user-supplied default) + "browse for a local file" option.
    - Background always rendered behind the UI at reduced opacity/with an
      overlay — never fully hidden, never overwhelming.
    - Per-board icon: emoji picker, plus support for a custom uploaded image
      as the icon.
    - Selected board name rendered more opaque/solid than unselected boards
      and the background, to show selection state.
    - Kanban columns/board surfaces restyled as semi-transparent panels —
      background must stay at least partially visible through them always.
    - Hide Electron's native File/Edit/View/Window/Help menu; add a hamburger
      button that opens a separate in-app menu (houses the background
      picker now, structured for future settings). Board sidebar stays
      always visible.
    - General Fluent-style polish: rounded corners, soft shadows, restrained
      accent usage, consistent with MS To Do's aesthetic.
  - Out:
    - Full light/dark theme system beyond what's needed for this look.
    - Cloud sync / multi-device (already out of scope for the project).
    - Curating more than one or two extra built-in gallery backgrounds
      beyond the user-supplied default.
- **Definition of Done**:
  - User can pick a background from the built-in gallery or browse for a
    local file; selection persists across restarts.
  - Background always renders faded/overlaid behind content; never fully
    hidden behind opaque panels.
  - Boards support an emoji icon or a custom uploaded image as their icon,
    shown next to the board name.
  - Selected board name is visibly more opaque/solid than unselected boards
    and the background.
  - Columns/cards render as semi-transparent surfaces; background stays
    partially visible through them at all times.
  - Native Electron menu bar is hidden; a hamburger button opens an app menu
    containing the background picker.
  - User reviews and confirms the overall look matches the intended
    Windows 11/Fluent, MS-To-Do-like feel.
- **Constraints**:
  - Prefer CSS + targeted component changes over restructuring; route native
    file dialogs through Electron's main-process IPC, consistent with the
    existing `window.taskApi` bridge pattern.
  - Custom background/icon images get copied into the app's userData
    directory (not referenced by original disk path) so they survive if the
    source file moves, and offline packaging stays reliable.
- **Risks**:
  - Arbitrary user-chosen backgrounds + translucent panels risk text
    legibility issues — needs a guaranteed-minimum overlay/contrast
    regardless of image chosen.
  - New IPC surface (file dialogs, image copy) isn't covered by existing
    crash-safety hardening (Intent 9 in PersonalTaskTracker) — may warrant a
    small follow-up check.
- **Resources**: User-supplied default background image, to be placed at
  `src/assets/backgrounds/default.jpg` (or appropriate extension).
- **Dependencies**: Builds on existing BoardSwitcher, KanbanColumnsUI, and
  CardCRUD UI, and the established Electron IPC bridge pattern (all from
  `Intents/PersonalTaskTracker/`).
