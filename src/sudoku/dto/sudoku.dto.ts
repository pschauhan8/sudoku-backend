import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ArrayMaxSize,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Difficulty, SudokuGrid } from '../sudoku.types';

export class GeneratePuzzleDto {
  @ApiPropertyOptional({
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium',
    description: 'Difficulty level of the puzzle',
  })
  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard', 'expert'])
  difficulty?: Difficulty = 'medium';
}

export class ValidatePuzzleDto {
  @ApiProperty({
    description: 'Current 9x9 board state. Empty cells represented by 0.',
    example: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
  })
  @IsArray()
  @ArrayMinSize(9)
  @ArrayMaxSize(9)
  board: SudokuGrid;
}

export class SolvePuzzleDto {
  @ApiProperty({
    description: '9x9 Sudoku board to solve (0 for empty cells)',
  })
  @IsArray()
  @ArrayMinSize(9)
  @ArrayMaxSize(9)
  board: SudokuGrid;
}

export class HintRequestDto {
  @ApiProperty({
    description: 'Current 9x9 board state',
  })
  @IsArray()
  @ArrayMinSize(9)
  @ArrayMaxSize(9)
  board: SudokuGrid;

  @ApiPropertyOptional({
    description: 'Optional pre-solved 9x9 grid to speed up hint generation',
  })
  @IsOptional()
  @IsArray()
  solution?: SudokuGrid;
}
