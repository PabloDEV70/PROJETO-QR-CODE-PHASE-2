import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * User query ranking statistics
 * Aggregates query costs per user/login
 */
export class UserQueryRankingDto {
  @ApiProperty({ description: 'Login name of the user' })
  login_name: string;

  @ApiPropertyOptional({ description: 'Host name of the user machine' })
  host_name?: string | null;

  @ApiPropertyOptional({ description: 'Program/application name' })
  program_name?: string | null;

  @ApiPropertyOptional({ description: 'Client IP address' })
  client_ip?: string | null;

  @ApiProperty({
    description: 'Source type: SANKHYA, DBA_TOOL, APPLICATION, or EXTERNAL',
    enum: ['SANKHYA', 'DBA_TOOL', 'APPLICATION', 'EXTERNAL'],
  })
  source_type: 'SANKHYA' | 'DBA_TOOL' | 'APPLICATION' | 'EXTERNAL';

  @ApiProperty({ description: 'Number of active sessions for this user' })
  session_count: number;

  @ApiProperty({ description: 'Total CPU time consumed in milliseconds' })
  total_cpu_time: number;

  @ApiProperty({ description: 'Total elapsed time in milliseconds' })
  total_elapsed_time: number;

  @ApiProperty({ description: 'Total logical reads' })
  total_logical_reads: number;

  @ApiProperty({ description: 'Total writes' })
  total_writes: number;

  @ApiProperty({ description: 'Average CPU time per session' })
  avg_cpu_time: number;

  @ApiProperty({ description: 'Average logical reads per session' })
  avg_logical_reads: number;

  @ApiProperty({ description: 'Calculated cost score for ranking' })
  cost_score: number;
}
