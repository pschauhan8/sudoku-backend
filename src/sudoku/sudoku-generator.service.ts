import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  Difficulty,
  SudokuGrid,
  SudokuPuzzleResponse,
  DailySudokuResponse,
} from './sudoku.types';

// Pseudo-Random Number Generator using Mulberry32 for deterministic daily puzzles
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

@Injectable()
export class SudokuGeneratorService {
  /**
   * Generates an empty 9x9 grid
   */
  createEmptyGrid(): SudokuGrid {
    return Array.from({ length: 9 }, () => Array(9).fill(0));
  }

  /**
   * Deep clone a 9x9 grid
   */
  cloneGrid(grid: SudokuGrid): SudokuGrid {
    return grid.map((row) => [...row]);
  }

  /**
   * Check if placing num at (row, col) is safe in grid
   */
  isSafe(grid: SudokuGrid, row: number, col: number, num: number): boolean {
    for (let c = 0; c < 9; c++) {
      if (grid[row][c] === num) return false;
    }
    for (let r = 0; r < 9; r++) {
      if (grid[r][col] === num) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (grid[startRow + r][startCol + c] === num) return false;
      }
    }
    return true;
  }

  /**
   * Fisher-Yates shuffle array with custom or Math.random
   */
  private shuffle<T>(array: T[], rng = Math.random): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Fill a 3x3 diagonal box
   */
  private fillBox(grid: SudokuGrid, startRow: number, startCol: number, rng = Math.random) {
    const nums = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);
    let idx = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid[startRow + r][startCol + c] = nums[idx++];
      }
    }
  }

  /**
   * Find first empty cell
   */
  private findEmptyCell(grid: SudokuGrid): [number, number] | null {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) return [r, c];
      }
    }
    return null;
  }

  /**
   * Backtracking solver that fills the remaining cells with a randomized number order
   */
  solveGrid(grid: SudokuGrid, rng = Math.random): boolean {
    const emptyCell = this.findEmptyCell(grid);
    if (!emptyCell) return true; // solved

    const [row, col] = emptyCell;
    const nums = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);

    for (const num of nums) {
      if (this.isSafe(grid, row, col, num)) {
        grid[row][col] = num;
        if (this.solveGrid(grid, rng)) return true;
        grid[row][col] = 0;
      }
    }
    return false;
  }

  /**
   * Solves a grid and counts solutions up to limit (used to verify uniqueness)
   */
  countSolutions(grid: SudokuGrid, limit = 2): number {
    let count = 0;

    const solve = (): void => {
      if (count >= limit) return;

      const emptyCell = this.findEmptyCell(grid);
      if (!emptyCell) {
        count++;
        return;
      }

      const [row, col] = emptyCell;
      for (let num = 1; num <= 9; num++) {
        if (this.isSafe(grid, row, col, num)) {
          grid[row][col] = num;
          solve();
          grid[row][col] = 0;
          if (count >= limit) return;
        }
      }
    };

    solve();
    return count;
  }

  /**
   * Generate a complete valid 9x9 solution
   */
  generateCompleteBoard(rng = Math.random): SudokuGrid {
    const grid = this.createEmptyGrid();
    // Fill three independent 3x3 diagonal boxes
    this.fillBox(grid, 0, 0, rng);
    this.fillBox(grid, 3, 3, rng);
    this.fillBox(grid, 6, 6, rng);

    // Solve remaining grid
    this.solveGrid(grid, rng);
    return grid;
  }

  /**
   * Get target clues range by difficulty
   */
  getTargetClues(difficulty: Difficulty): { min: number; max: number } {
    switch (difficulty) {
      case 'easy':
        return { min: 38, max: 44 };
      case 'medium':
        return { min: 30, max: 35 };
      case 'hard':
        return { min: 26, max: 29 };
      case 'expert':
        return { min: 22, max: 25 };
      default:
        return { min: 32, max: 36 };
    }
  }

  /**
   * Dig holes from the solved grid while maintaining a unique solution
   */
  createPuzzleFromSolution(
    solution: SudokuGrid,
    difficulty: Difficulty,
    rng = Math.random,
  ): { puzzle: SudokuGrid; clueCount: number } {
    const puzzle = this.cloneGrid(solution);
    const { min: targetMin, max: targetMax } = this.getTargetClues(difficulty);
    const targetClues = Math.floor(rng() * (targetMax - targetMin + 1)) + targetMin;

    // Create a list of all 81 positions
    const positions: [number, number][] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        positions.push([r, c]);
      }
    }
    const shuffledPositions = this.shuffle(positions, rng);

    let currentClues = 81;

    for (const [r, c] of shuffledPositions) {
      if (currentClues <= targetClues) break;

      const tempVal = puzzle[r][c];
      puzzle[r][c] = 0;

      // Check if board still has a unique solution
      const testCopy = this.cloneGrid(puzzle);
      const solutionsCount = this.countSolutions(testCopy, 2);

      if (solutionsCount === 1) {
        currentClues--;
      } else {
        // Revert removal if multiple solutions occur
        puzzle[r][c] = tempVal;
      }
    }

    return { puzzle, clueCount: currentClues };
  }

  /**
   * Generate a new random puzzle with specified difficulty
   */
  generatePuzzle(difficulty: Difficulty = 'medium'): SudokuPuzzleResponse {
    const solution = this.generateCompleteBoard();
    const { puzzle, clueCount } = this.createPuzzleFromSolution(solution, difficulty);

    return {
      id: randomUUID(),
      difficulty,
      puzzle,
      solution,
      initialClues: clueCount,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Generate a deterministic daily puzzle based on date seed (YYYY-MM-DD)
   */
  generateDailyPuzzle(dateString?: string): DailySudokuResponse {
    const today = dateString || new Date().toISOString().split('T')[0];
    const seed = stringToSeed(today);
    const rng = mulberry32(seed);

    // Rotate difficulties predictably across days of the week:
    // Mon: easy, Tue: medium, Wed: medium, Thu: hard, Fri: hard, Sat: expert, Sun: expert
    const dayOfWeek = new Date(today).getUTCDay();
    const difficultyMap: Record<number, Difficulty> = {
      0: 'expert', // Sun
      1: 'easy',   // Mon
      2: 'medium', // Tue
      3: 'medium', // Wed
      4: 'hard',   // Thu
      5: 'hard',   // Fri
      6: 'expert', // Sat
    };
    const difficulty = difficultyMap[dayOfWeek] || 'medium';

    const solution = this.generateCompleteBoard(rng);
    const { puzzle, clueCount } = this.createPuzzleFromSolution(solution, difficulty, rng);

    return {
      date: today,
      difficulty,
      puzzle,
      solution,
      initialClues: clueCount,
    };
  }
}
