# Seizen - Personal KanBan Task App

A fully offline, desktop kanban board for personal task tracking, built using Claude code. Run
multiple boards (one per project), each with its own columns, colored
cards, due dates, and reminders — all stored locally, no account or
network connection required.

## Features

- **Multiple boards** — switch between separate projects from the sidebar,
  each with its own emoji or custom-image icon
- **Kanban columns** — create, rename, and delete columns per board
- **Colored cards** — title, description, an 8-swatch color picker, and a
  matching background tint alongside the accent border
- **Drag and drop** — reorder cards within a column or move them across
  columns; drag boards and columns themselves into a new order via a grip
  handle, with the order persisted
- **Due dates & reminders** — overdue cards are flagged, and the app fires
  desktop notifications for upcoming/overdue due dates on a poll and on launch
- **Customizable look** — a Fluent-inspired, Windows 11-style theme with
  translucent "glass" boards/columns over a customizable background image
  (built-in gallery or browse for a local file), a hamburger app menu in
  place of the native menu bar, and clear visual emphasis on the selected
  board
- **Fully offline** — all data is stored in a local SQLite database; nothing
  leaves your machine

## Tech Stack

- [Electron](https://www.electronjs.org/) — desktop shell
- [React](https://react.dev/) + TypeScript — UI
- [Vite](https://vitejs.dev/) — dev server / bundler
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — local storage
- [dnd-kit](https://dndkit.com/) — drag-and-drop
- [electron-builder](https://www.electron.build/) — packaging/installers

## Development

Requires [Node.js](https://nodejs.org/) (LTS) and npm.

```bash
npm install
npm run dev      # starts the Vite dev server + Electron, with hot reload
```

### Other scripts

| Command | What it does |
|---|---|
| `npm run build` | Type-check and build the production web bundle (`dist/`) |
| `npm run smoke:db` | Smoke test for the SQLite data layer |
| `npm run smoke:crash` | Verifies the database survives a hard crash (SIGKILL) mid-write |
| `npm run package:linux` | Build a Linux AppImage installer (see below) |
| `npm run package:win` | Build a Windows installer (see below) |

## Building an installer

Installers are built per-platform with `electron-builder` and must be built
**on the target OS** (cross-compiling the Windows installer from Linux
requires Wine and isn't supported in every environment):

```bash
# On Linux:
npm run package:linux     # → release/Seizen - Personal KanBan Task App-<version>.AppImage

# On Windows:
npm run package:win       # → release/Seizen - Personal KanBan Task App Setup <version>.exe
```

Run the resulting installer/AppImage to install and launch the app — it
works fully offline, independent of the dev environment.

## License

This project is licensed under the
[PolyForm Noncommercial License 1.0.0](LICENSE) — free to use, modify, and
share for any noncommercial purpose, with attribution to the original author
retained. Commercial use requires a separate license from the author. See
[LICENSE](LICENSE) for the full terms.
