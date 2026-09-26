import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class SyncProfileDto {
  @ApiProperty({ description: 'Unique user identifier (UUID generated on client)' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Display username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiPropertyOptional({ description: 'Aggregated gameplay statistics' })
  @IsOptional()
  @IsObject()
  stats?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Currently active game state' })
  @IsOptional()
  @IsObject()
  activeGame?: Record<string, any>;
}
