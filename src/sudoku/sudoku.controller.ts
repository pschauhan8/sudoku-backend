import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SudokuGeneratorService } from './sudoku-generator.service';
import { SudokuValidatorService } from './sudoku-validator.service';
import { SudokuHintService } from './sudoku-hint.service';
import {
  GeneratePuzzleDto,
  ValidatePuzzleDto,
  SolvePuzzleDto,
  HintRequestDto,
} from './dto/sudoku.dto';
import {
  SudokuPuzzleResponse,
  DailySudokuResponse,
  ValidationResponse,
  HintResponse,
  Difficulty,
} from './sudoku.types';

@ApiTags('Sudoku Engine')
@Controller('api/sudoku')
export class SudokuController {
  constructor(
    private readonly generatorService: SudokuGeneratorService,
    private readonly validatorService: SudokuValidatorService,
    private readonly hintService: SudokuHintService,
  ) {}

  @Get('generate')
  @ApiOperation({ summary: 'Generate a new Sudoku puzzle with guaranteed unique solution' })
  @ApiResponse({ status: 200, description: 'Puzzle generated successfully' })
  generatePuzzle(@Query() query: GeneratePuzzleDto): SudokuPuzzleResponse {
    const diff = (query.difficulty || 'medium') as Difficulty;
    return this.generatorService.generatePuzzle(diff);
  }

  @Get('daily')
  @ApiOperation({ summary: 'Get the daily challenge puzzle for today or a specific date' })
  @ApiQuery({ name: 'date', required: false, example: '2026-09-25' })
  @ApiResponse({ status: 200, description: 'Daily challenge puzzle returned' })
  getDailyPuzzle(@Query('date') date?: string): DailySudokuResponse {
    return this.generatorService.generateDailyPuzzle(date);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate board state and identify conflicts' })
  @ApiResponse({ status: 200, description: 'Validation result with conflicting cells' })
  validatePuzzle(@Body() dto: ValidatePuzzleDto): ValidationResponse {
    return this.validatorService.validateBoard(dto.board);
  }

  @Post('solve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solve any valid 9x9 Sudoku puzzle' })
  @ApiResponse({ status: 200, description: 'Solved Sudoku grid' })
  solvePuzzle(@Body() dto: SolvePuzzleDto): { solved: boolean; solution: number[][] } {
    const copy = this.generatorService.cloneGrid(dto.board);
    const solved = this.generatorService.solveGrid(copy);
    if (!solved) {
      throw new BadRequestException('The provided Sudoku puzzle is unsolvable.');
    }
    return { solved: true, solution: copy };
  }

  @Post('hint')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a smart hint with technique and explanation' })
  @ApiResponse({ status: 200, description: 'Smart hint for next move' })
  getHint(@Body() dto: HintRequestDto): HintResponse {
    const hint = this.hintService.getHint(dto.board, dto.solution);
    if (!hint) {
      throw new BadRequestException('No valid hint available for the current board.');
    }
    return hint;
  }
}
