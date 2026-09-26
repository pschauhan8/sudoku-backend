import { Injectable } from '@nestjs/common';
import { DynamoDbService } from '../database/dynamodb.service';
import { SubmitScoreDto, GetLeaderboardQueryDto } from './leaderboard.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class LeaderboardService {
  constructor(private readonly db: DynamoDbService) {}

  async submitScore(dto: SubmitScoreDto) {
    const entry = {
      id: randomUUID(),
      difficulty: dto.difficulty.toLowerCase(),
      timeScore: dto.timeSeconds,
      userId: dto.userId,
      username: dto.username,
      mistakes: dto.mistakes ?? 0,
      hintsUsed: dto.hintsUsed ?? 0,
      completedAt: new Date().toISOString(),
    };

    await this.db.put(this.db.leaderboardTable, entry);
    return entry;
  }

  async getTopScores(query: GetLeaderboardQueryDto) {
    const diff = (query.difficulty || 'medium').toLowerCase();
    const limit = query.limit || 20;

    const items = await this.db.query({
      table: this.db.leaderboardTable,
      keyConditionExpression: 'difficulty = :diff',
      expressionAttributeValues: {
        ':diff': diff,
      },
      scanIndexForward: true, // Lowest time (fastest) first
      limit,
    });

    return items.map((item, index) => ({
      rank: index + 1,
      id: item.id,
      userId: item.userId,
      username: item.username,
      difficulty: item.difficulty,
      timeSeconds: item.timeScore,
      mistakes: item.mistakes,
      hintsUsed: item.hintsUsed,
      completedAt: item.completedAt,
    }));
  }
}
