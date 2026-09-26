import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SudokuModule } from './sudoku/sudoku.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [DatabaseModule, SudokuModule, UsersModule, LeaderboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
