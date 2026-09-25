import { Module } from '@nestjs/common';
import { SudokuController } from './sudoku.controller';
import { SudokuGeneratorService } from './sudoku-generator.service';
import { SudokuValidatorService } from './sudoku-validator.service';
import { SudokuHintService } from './sudoku-hint.service';

@Module({
  controllers: [SudokuController],
  providers: [SudokuGeneratorService, SudokuValidatorService, SudokuHintService],
  exports: [SudokuGeneratorService, SudokuValidatorService, SudokuHintService],
})
export class SudokuModule {}
