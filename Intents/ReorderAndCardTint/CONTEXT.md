# Reorder Boards/Columns & Card Color Tint

> Owner: duanejevon@gmail.com  ·  Created: 2026-06-23

## Begin (raw)
<!-- 3-minute brain dump. Do not edit or reinterpret. -->
Allow reordering of boards in the board list, and reordering of columns. Also add a feature to set the colour background tint of the cards to match the set colour.

## Refine (scope)
- **Goal**: Let users drag-reorder boards in the sidebar list and drag-reorder columns within a board, with order persisted. Also give cards a subtle background tint matching their assigned color, in addition to the existing left-border accent.
- **In / Out of scope**:
  - In: drag-and-drop reorder of boards (sidebar list); drag-and-drop reorder of columns (within a single board); persist new order to SQLite (`boards.position`, `columns.position` already exist as columns); tinted card background (fixed-opacity wash of the exact picked color) added alongside the existing left-border accent.
  - Out: keyboard-accessible reordering (arrow keys / move buttons); moving a column between boards; nesting/grouping boards; hand-tuned per-swatch tint colors (use computed opacity instead).
- **Definition of Done**: User can drag a board in the sidebar to a new position and it stays there after restart. User can drag a column within a board to a new position and it stays there after restart. Every card shows a subtle background tint matching its color swatch, with the left-border accent still present.
- **Constraints**: Reuse existing dnd-kit pattern already used for card drag-and-drop (`@dnd-kit/core`, `@dnd-kit/sortable`). Reuse existing `position` integer columns already present in the `boards` and `columns` SQLite tables — no schema migration expected. Follow existing IPC pattern (`cards:reorderColumn` in electron/main.js + preload.js) for new `boards:reorder` / `columns:reorder` handlers.
- **Risks**: (optional)
- **Resources**: (optional)
- **Dependencies**: None — both features build on existing dnd-kit infrastructure and existing `position` schema columns.
