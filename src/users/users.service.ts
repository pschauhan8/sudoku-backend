import { Injectable } from '@nestjs/common';
import { DynamoDbService } from '../database/dynamodb.service';
import { SyncProfileDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly db: DynamoDbService) {}

  async getUser(userId: string) {
    return this.db.get(this.db.usersTable, { userId });
  }

  async syncProfile(dto: SyncProfileDto) {
    const existing = await this.getUser(dto.userId);
    const now = new Date().toISOString();

    const item = {
      userId: dto.userId,
      username: dto.username,
      stats: dto.stats || existing?.stats || {},
      activeGame: dto.activeGame || existing?.activeGame || null,
      updatedAt: now,
      createdAt: existing?.createdAt || now,
    };

    await this.db.put(this.db.usersTable, item);
    return item;
  }

  async getActiveGame(userId: string) {
    const user = await this.getUser(userId);
    return user?.activeGame || null;
  }
}
