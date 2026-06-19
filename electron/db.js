const Database = require("better-sqlite3");

function nextPosition(db, table, whereClause, params) {
  const row = db
    .prepare(`SELECT COALESCE(MAX(position), -1) + 1 AS next FROM ${table} WHERE ${whereClause}`)
    .get(...params);
  return row.next;
}

function createStore(dbPath) {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS boards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      position INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS columns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      position INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      column_id INTEGER NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '#a3a3a3',
      due_date TEXT,
      position INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return {
    close() {
      db.close();
    },

    listBoards() {
      return db.prepare("SELECT * FROM boards ORDER BY position").all();
    },
    createBoard(name) {
      const position = nextPosition(db, "boards", "1=1", []);
      const { lastInsertRowid } = db
        .prepare("INSERT INTO boards (name, position) VALUES (?, ?)")
        .run(name, position);
      return db.prepare("SELECT * FROM boards WHERE id = ?").get(lastInsertRowid);
    },
    renameBoard(id, name) {
      db.prepare("UPDATE boards SET name = ? WHERE id = ?").run(name, id);
      return db.prepare("SELECT * FROM boards WHERE id = ?").get(id);
    },
    deleteBoard(id) {
      db.prepare("DELETE FROM boards WHERE id = ?").run(id);
    },

    listColumns(boardId) {
      return db.prepare("SELECT * FROM columns WHERE board_id = ? ORDER BY position").all(boardId);
    },
    createColumn(boardId, name) {
      const position = nextPosition(db, "columns", "board_id = ?", [boardId]);
      const { lastInsertRowid } = db
        .prepare("INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)")
        .run(boardId, name, position);
      return db.prepare("SELECT * FROM columns WHERE id = ?").get(lastInsertRowid);
    },
    renameColumn(id, name) {
      db.prepare("UPDATE columns SET name = ? WHERE id = ?").run(name, id);
      return db.prepare("SELECT * FROM columns WHERE id = ?").get(id);
    },
    deleteColumn(id) {
      db.prepare("DELETE FROM columns WHERE id = ?").run(id);
    },

    listCards(columnId) {
      return db.prepare("SELECT * FROM cards WHERE column_id = ? ORDER BY position").all(columnId);
    },
    listCardsByBoard(boardId) {
      return db
        .prepare(
          `SELECT cards.* FROM cards
           JOIN columns ON cards.column_id = columns.id
           WHERE columns.board_id = ?
           ORDER BY cards.column_id, cards.position`,
        )
        .all(boardId);
    },
    createCard(columnId, input) {
      const { title, description = "", color = "#a3a3a3", due_date = null } = input;
      const position = nextPosition(db, "cards", "column_id = ?", [columnId]);
      const { lastInsertRowid } = db
        .prepare(
          "INSERT INTO cards (column_id, title, description, color, due_date, position) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .run(columnId, title, description, color, due_date, position);
      return db.prepare("SELECT * FROM cards WHERE id = ?").get(lastInsertRowid);
    },
    updateCard(id, fields) {
      const card = db.prepare("SELECT * FROM cards WHERE id = ?").get(id);
      if (!card) return null;
      const merged = { ...card, ...fields };
      db.prepare(
        `UPDATE cards
         SET title = ?, description = ?, color = ?, due_date = ?, position = ?, column_id = ?, updated_at = datetime('now')
         WHERE id = ?`,
      ).run(
        merged.title,
        merged.description,
        merged.color,
        merged.due_date,
        merged.position,
        merged.column_id,
        id,
      );
      return db.prepare("SELECT * FROM cards WHERE id = ?").get(id);
    },
    deleteCard(id) {
      db.prepare("DELETE FROM cards WHERE id = ?").run(id);
    },
    reorderColumn(columnId, cardIds) {
      const setPosition = db.prepare(
        "UPDATE cards SET column_id = ?, position = ? WHERE id = ?",
      );
      const applyAll = db.transaction((ids) => {
        ids.forEach((id, index) => setPosition.run(columnId, index, id));
      });
      applyAll(cardIds);
    },
  };
}

module.exports = { createStore };
