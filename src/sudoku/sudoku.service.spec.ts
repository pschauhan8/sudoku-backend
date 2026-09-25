import { Test, TestingModule } from '@nestjs/testing';
import { SudokuGeneratorService } from './sudoku-generator.service';
import { SudokuValidatorService } from './sudoku-validator.service';
import { SudokuHintService } from './sudoku-hint.service';

describe('Sudoku Engine Unit Tests', () => {
  let generator: SudokuGeneratorService;
  let validator: SudokuValidatorService;
  let hintService: SudokuHintService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SudokuGeneratorService, SudokuValidatorService, SudokuHintService],
    }).compile();

    generator = module.get<SudokuGeneratorService>(SudokuGeneratorService);
    validator = module.get<SudokuValidatorService>(SudokuValidatorService);
    hintService = module.get<SudokuHintService>(SudokuHintService);
  });

  it('should generate a valid complete 9x9 board', () => {
    const board = generator.generateCompleteBoard();
    expect(board.length).toBe(9);
    for (let r = 0; r < 9; r++) {
      expect(board[r].length).toBe(9);
      for (let c = 0; c < 9; c++) {
        expect(board[r][c]).toBeGreaterThanOrEqual(1);
        expect(board[r][c]).toBeLessThanOrEqual(9);
      }
    }
    const validation = validator.validateBoard(board);
    expect(validation.isValid).toBe(true);
    expect(validation.isComplete).toBe(true);
    expect(validation.conflicts.length).toBe(0);
  });

  it('should generate puzzles with unique solution and target clue counts', () => {
    const puzzleResult = generator.generatePuzzle('easy');
    expect(puzzleResult.difficulty).toBe('easy');
    expect(puzzleResult.puzzle.length).toBe(9);
    expect(puzzleResult.solution.length).toBe(9);
    expect(puzzleResult.initialClues).toBeGreaterThanOrEqual(35);

    // Uniqueness check
    const solutions = generator.countSolutions(puzzleResult.puzzle, 2);
    expect(solutions).toBe(1);
  });

  it('should detect row, column, and block conflicts correctly', () => {
    const badBoard = [
      [5, 5, 0, 0, 0, 0, 0, 0, 0], // Row conflict with two 5s
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    const validation = validator.validateBoard(badBoard);
    expect(validation.isValid).toBe(false);
    expect(validation.conflicts.length).toBeGreaterThan(0);
  });

  it('should produce deterministic daily puzzles for a given date', () => {
    const p1 = generator.generateDailyPuzzle('2026-09-25');
    const p2 = generator.generateDailyPuzzle('2026-09-25');
    expect(p1.puzzle).toEqual(p2.puzzle);
    expect(p1.solution).toEqual(p2.solution);
  });

  it('should provide hints for valid puzzles', () => {
    const puzzleResult = generator.generatePuzzle('easy');
    const hint = hintService.getHint(puzzleResult.puzzle, puzzleResult.solution);
    expect(hint).not.toBeNull();
    expect(hint?.row).toBeGreaterThanOrEqual(0);
    expect(hint?.col).toBeGreaterThanOrEqual(0);
    expect(hint?.value).toBeGreaterThanOrEqual(1);
    expect(hint?.value).toBeLessThanOrEqual(9);
  });
});
