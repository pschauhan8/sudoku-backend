import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SyncProfileDto } from './users.dto';

@ApiTags('User Profile & Cloud Sync')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get user profile by userId' })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  getUser(@Param('userId') userId: string) {
    return this.usersService.getUser(userId);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync user stats and active game to the cloud' })
  @ApiResponse({ status: 200, description: 'Profile successfully synchronized' })
  syncProfile(@Body() dto: SyncProfileDto) {
    return this.usersService.syncProfile(dto);
  }

  @Get(':userId/active-game')
  @ApiOperation({ summary: 'Get active cloud saved game for user' })
  @ApiResponse({ status: 200, description: 'Active game returned' })
  getActiveGame(@Param('userId') userId: string) {
    return this.usersService.getActiveGame(userId);
  }
}
