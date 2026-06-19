export interface Board {
  id: number;
  name: string;
  position: number;
  created_at: string;
}

export interface Column {
  id: number;
  board_id: number;
  name: string;
  position: number;
  created_at: string;
}

export interface Card {
  id: number;
  column_id: number;
  title: string;
  description: string;
  color: string;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface NewCardInput {
  title: string;
  description?: string;
  color?: string;
  due_date?: string | null;
}

export interface CardUpdateInput {
  title?: string;
  description?: string;
  color?: string;
  due_date?: string | null;
  position?: number;
  column_id?: number;
}
