import type { BackgroundSelection, Board, Card, CardUpdateInput, Column, NewCardInput } from "./types";

export interface TaskApi {
  boards: {
    list(): Promise<Board[]>;
    create(name: string): Promise<Board>;
    rename(id: number, name: string): Promise<Board>;
    delete(id: number): Promise<void>;
    setIcon(id: number, icon: string): Promise<Board>;
    browseIcon(id: number): Promise<Board | null>;
    reorder(boardIds: number[]): Promise<void>;
  };
  columns: {
    list(boardId: number): Promise<Column[]>;
    create(boardId: number, name: string): Promise<Column>;
    rename(id: number, name: string): Promise<Column>;
    delete(id: number): Promise<void>;
    reorder(columnIds: number[]): Promise<void>;
  };
  cards: {
    list(columnId: number): Promise<Card[]>;
    listWithDueDates(): Promise<Card[]>;
    listByBoard(boardId: number): Promise<Card[]>;
    create(columnId: number, input: NewCardInput): Promise<Card>;
    update(id: number, fields: CardUpdateInput): Promise<Card | null>;
    delete(id: number): Promise<void>;
    reorderColumn(columnId: number, cardIds: number[]): Promise<void>;
  };
  settings: {
    getBackground(): Promise<BackgroundSelection>;
    setBuiltinBackground(id: string): Promise<BackgroundSelection>;
    browseForBackground(): Promise<BackgroundSelection | null>;
  };
}

declare global {
  interface Window {
    taskApi: TaskApi;
  }
}
