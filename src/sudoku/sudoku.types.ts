export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type SudokuGrid = number[][]; // 9x9 matrix, 0 denotes empty cell

export interface CellCoord {
  row: number;
  col: number;
}

export interface ConflictCell {
  row: number;
  col: number;
  value: number;
  conflictType: 'row' | 'column' | 'block';
}

export interface ValidationResponse {
  isValid: boolean;
  isComplete: boolean;
  conflicts: ConflictCell[];
  errorsCount: number;
}

export interface HintResponse {
  row: number;
  col: number;
  value: number;
  technique: string;
  explanation: string;
}

export interface SudokuPuzzleResponse {
  id: string;
  difficulty: Difficulty;
  puzzle: SudokuGrid;
  solution: SudokuGrid;
  initialClues: number;
  createdAt: string;
}

export interface DailySudokuResponse {
  date: string; // YYYY-MM-DD
  difficulty: Difficulty;
  puzzle: SudokuGrid;
  solution: SudokuGrid;
  initialClues: number;
}
