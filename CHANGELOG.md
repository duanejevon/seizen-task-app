# Changelog

All notable changes to this project are documented in this file.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [1.3.2] - 2026-07-01

- Applied the same in-app confirmation to column and board deletion,
  replacing their native `window.confirm()` dialogs. This is both a
  consistency and a robustness improvement: it removes the last native
  modals that could interrupt an in-progress drag-and-drop interaction
  and freeze the board's text inputs.

## [1.3.1] - 2026-07-01

- Fixed a bug where deleting a card left every text box on the board
  unusable (appearing read-only), blocking edits to other cards and the
  adding of new ones. Deleting a card used a native `window.confirm()`
  dialog, whose modal interrupted the card's in-progress drag-and-drop
  pointer interaction and stranded dnd-kit's global selection/click
  listeners. Card deletion now uses an inline in-app confirmation
  instead of the native dialog, which removes the root cause.

## [1.3.0] - 2026-06-25

- Added a macOS packaging target (`npm run package:mac` → DMG installer,
  productivity category). Still has to be built on an actual Mac — the
  DMG step depends on macOS's `sips` tool — but the underlying `.app`
  bundle cross-builds fine from Linux/Windows too.

## [1.2.1] - 2026-06-24

- Renamed the app from DunIT to Seizen across packaging metadata, window
  title, and internal naming, with a one-time migration that moves an
  existing install's local database, backgrounds, and board icons over
  to the new userData location so nothing is lost on upgrade.
- Fixed column drag-and-drop: dragging a column and releasing over a card
  instead of precisely on a column's header (the norm with natural,
  non-straight mouse movement) silently dropped the reorder. Collision
  detection now only matches a dragged column against other columns
  (and a dragged card against other cards).

## [1.2.0] - 2026-06-23

- Added drag-to-reorder for boards in the sidebar and columns in the
  kanban header, both via a grip handle, with the new order persisted.
- Cards now show a background tint matching their accent color.

## [1.1.2] - 2026-06-23

- Collapsed the "New board" and "New column" forms behind `+` trigger
  buttons instead of always showing an open form.

## [1.1.1] - 2026-06-23

- Fixed the hamburger app menu and icon picker panels showing a
  translucent background instead of a solid, readable one.

## [1.1.0] - 2026-06-22

First tagged release. Covers all work from initial scaffolding through
the visual styling pass:

- Electron + React + TypeScript app shell, with a local SQLite store
  (boards, columns, cards) wired up over IPC.
- Board switcher (create/rename/delete/switch boards), kanban columns
  per board (add/rename/delete), and card CRUD with title, description,
  and an 8-swatch color picker.
- Drag-and-drop for cards within and across columns.
- Due dates, an overdue badge, and desktop notification reminders.
- Crash-safety hardening: tested against a hard kill mid-write, with a
  fresh-install path and surfaced storage errors.
- Packaging: app icon, Linux AppImage installer.
- Fluent-inspired visual redesign: design tokens, translucent "glass"
  surfaces, a customizable background image (built-in gallery or a local
  file), a hamburger app menu replacing the native menu bar, a per-board
  icon picker, and clearer visual emphasis on the selected board.
- Renamed the app to DunIT; added README and PolyForm Noncommercial
  license.
