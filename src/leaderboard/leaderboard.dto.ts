import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, Min } from 'class-validator';

export class SubmitScoreDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Player display name' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Difficulty or daily challenge identifier',
    example: 'medium',
  })
  @IsString()
  @IsNotEmpty()
  difficulty: string; // 'easy' | 'medium' | 'hard' | 'expert' | 'daily:YYYY-MM-DD'

  @ApiProperty({ description: 'Time taken in seconds to solve', example: 145 })
  @IsNumber()
  @Min(1)
  timeSeconds: number;

  @ApiPropertyOptional({ description: 'Number of mistakes made', default: 0 })
  @IsOptional()
  @IsNumber()
  mistakes?: number = 0;

  @ApiPropertyOptional({ description: 'Number of hints used', default: 0 })
  @IsOptional()
  @IsNumber()
  hintsUsed?: number = 0;
}

export class GetLeaderboardQueryDto {
  @ApiPropertyOptional({
    description: 'Difficulty level or daily challenge key',
    default: 'medium',
  })
  @IsOptional()
  @IsString()
  difficulty?: string = 'medium';

  @ApiPropertyOptional({ description: 'Max records to return', default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number = 20;
}
