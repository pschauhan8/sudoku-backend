import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { SubmitScoreDto, GetLeaderboardQueryDto } from './leaderboard.dto';

@ApiTags('Global Leaderboard')
@Controller('api/leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Post('submit')
  @ApiOperation({ summary: 'Submit a completed game score to global leaderboard' })
  @ApiResponse({ status: 201, description: 'Score recorded on leaderboard' })
  submitScore(@Body() dto: SubmitScoreDto) {
    return this.leaderboardService.submitScore(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get global top scores by difficulty' })
  @ApiResponse({ status: 200, description: 'List of top ranked scores' })
  getLeaderboard(@Query() query: GetLeaderboardQueryDto) {
    return this.leaderboardService.getTopScores(query);
  }
}
