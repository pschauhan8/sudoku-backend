import { Injectable } from '@nestjs/common';
import {
  SudokuGrid,
  ConflictCell,
  ValidationResponse,
} from './sudoku.types';

@Injectable()
export class SudokuValidatorService {
  /**
   * Validate a Sudoku board state and return all conflicts
   */
  validateBoard(board: SudokuGrid, solution?: SudokuGrid): ValidationResponse {
    const conflicts: ConflictCell[] = [];
    const conflictMap = new Set<string>();

    const addConflict = (row: number, col: number, value: number, type: 'row' | 'column' | 'block') => {
      const key = `${row}-${col}-${type}`;
      if (!conflictMap.has(key)) {
        conflictMap.add(key);
        conflicts.push({ row, col, value, conflictType: type });
      }
    };

    // 1. Check rows
    for (let r = 0; r < 9; r++) {
      const seen = new Map<number, number[]>(); // value -> array of column indices
      for (let c = 0; c < 9; c++) {
        const val = board[r][c];
        if (val !== 0) {
          if (!seen.has(val)) seen.set(val, []);
          seen.get(val)!.push(c);
        }
      }
      for (const [val, cols] of seen.entries()) {
        if (cols.length > 1) {
          cols.forEach((col) => addConflict(r, col, val, 'row'));
        }
      }
    }

    // 2. Check columns
    for (let c = 0; c < 9; c++) {
      const seen = new Map<number, number[]>(); // value -> array of row indices
      for (let r = 0; r < 9; r++) {
        const val = board[r][c];
        if (val !== 0) {
          if (!seen.has(val)) seen.set(val, []);
          seen.get(val)!.push(r);
        }
      }
      for (const [val, rows] of seen.entries()) {
        if (rows.length > 1) {
          rows.forEach((row) => addConflict(row, c, val, 'column'));
        }
      }
    }

    // 3. Check 3x3 blocks
    for (let blockRow = 0; blockRow < 3; blockRow++) {
      for (let blockCol = 0; blockCol < 3; blockCol++) {
        const seen = new Map<number, { r: number; c: number }[]>();
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const actualR = blockRow * 3 + r;
            const actualC = blockCol * 3 + c;
            const val = board[actualR][actualC];
            if (val !== 0) {
              if (!seen.has(val)) seen.set(val, []);
              seen.get(val)!.push({ r: actualR, c: actualC });
            }
          }
        }
        for (const [val, cells] of seen.entries()) {
          if (cells.length > 1) {
            cells.forEach((cell) => addConflict(cell.r, cell.c, val, 'block'));
          }
        }
      }
    }

    // 4. Check if complete
    let emptyCount = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          emptyCount++;
        }
      }
    }

    // If an official solution was supplied, also verify against it
    if (solution) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const val = board[r][c];
          if (val !== 0 && val !== solution[r][c]) {
            addConflict(r, c, val, 'row');
          }
        }
      }
    }

    const isValid = conflicts.length === 0;
    const isComplete = isValid && emptyCount === 0;

    return {
      isValid,
      isComplete,
      conflicts,
      errorsCount: conflicts.length,
    };
  }

  /**
   * Check if a single move is currently valid
   */
  isValidMove(board: SudokuGrid, row: number, col: number, value: number): boolean {
    if (value < 1 || value > 9) return false;

    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && board[row][c] === value) return false;
    }

    // Check col
    for (let r = 0; r < 9; r++) {
      if (r !== row && board[r][col] === value) return false;
    }

    // Check 3x3 block
    const startR = Math.floor(row / 3) * 3;
    const startC = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const curR = startR + r;
        const curC = startC + c;
        if ((curR !== row || curC !== col) && board[curR][curC] === value) {
          return false;
        }
      }
    }

    return true;
  }
}
