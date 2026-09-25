import { Injectable } from '@nestjs/common';
import { SudokuGrid, HintResponse } from './sudoku.types';
import { SudokuGeneratorService } from './sudoku-generator.service';
import { SudokuValidatorService } from './sudoku-validator.service';

@Injectable()
export class SudokuHintService {
  constructor(
    private readonly generatorService: SudokuGeneratorService,
    private readonly validatorService: SudokuValidatorService,
  ) {}

  /**
   * Get valid candidates (1-9) for a specific cell
   */
  getCandidates(board: SudokuGrid, row: number, col: number): number[] {
    if (board[row][col] !== 0) return [];
    const candidates: number[] = [];
    for (let num = 1; num <= 9; num++) {
      if (this.validatorService.isValidMove(board, row, col, num)) {
        candidates.push(num);
      }
    }
    return candidates;
  }

  /**
   * Generate an intelligent hint for the player
   */
  getHint(board: SudokuGrid, precalculatedSolution?: SudokuGrid): HintResponse | null {
    // Strategy 1: Naked Single (only one valid candidate for this empty cell)
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          const candidates = this.getCandidates(board, r, c);
          if (candidates.length === 1) {
            const val = candidates[0];
            return {
              row: r,
              col: c,
              value: val,
              technique: 'Naked Single',
              explanation: `Cell at Row ${r + 1}, Column ${c + 1} can only be ${val} because all other numbers (1-9) are blocked by its row, column, or 3x3 box.`,
            };
          }
        }
      }
    }

    // Strategy 2: Hidden Single in Row (a number can only appear in one cell of a row)
    for (let r = 0; r < 9; r++) {
      for (let num = 1; num <= 9; num++) {
        const possibleCols: number[] = [];
        let alreadyPresent = false;
        for (let c = 0; c < 9; c++) {
          if (board[r][c] === num) {
            alreadyPresent = true;
            break;
          }
          if (board[r][c] === 0 && this.validatorService.isValidMove(board, r, c, num)) {
            possibleCols.push(c);
          }
        }
        if (!alreadyPresent && possibleCols.length === 1) {
          const c = possibleCols[0];
          return {
            row: r,
            col: c,
            value: num,
            technique: 'Hidden Single (Row)',
            explanation: `In Row ${r + 1}, the number ${num} can only be placed at Column ${c + 1}.`,
          };
        }
      }
    }

    // Strategy 3: Hidden Single in Column
    for (let c = 0; c < 9; c++) {
      for (let num = 1; num <= 9; num++) {
        const possibleRows: number[] = [];
        let alreadyPresent = false;
        for (let r = 0; r < 9; r++) {
          if (board[r][c] === num) {
            alreadyPresent = true;
            break;
          }
          if (board[r][c] === 0 && this.validatorService.isValidMove(board, r, c, num)) {
            possibleRows.push(r);
          }
        }
        if (!alreadyPresent && possibleRows.length === 1) {
          const r = possibleRows[0];
          return {
            row: r,
            col: c,
            value: num,
            technique: 'Hidden Single (Column)',
            explanation: `In Column ${c + 1}, the number ${num} can only be placed at Row ${r + 1}.`,
          };
        }
      }
    }

    // Strategy 4: Fallback with Solved Grid
    let solvedGrid = precalculatedSolution;
    if (!solvedGrid) {
      const copy = this.generatorService.cloneGrid(board);
      const isSolvable = this.generatorService.solveGrid(copy);
      if (isSolvable) {
        solvedGrid = copy;
      }
    }

    if (solvedGrid) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c] === 0) {
            const val = solvedGrid[r][c];
            return {
              row: r,
              col: c,
              value: val,
              technique: 'Logical Deduction',
              explanation: `By deductive elimination, Row ${r + 1}, Column ${c + 1} must be ${val}.`,
            };
          }
        }
      }
    }

    return null;
  }
}
