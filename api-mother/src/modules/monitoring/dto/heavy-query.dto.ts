import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Heavy query statistics with severity classification
 * Used for identifying and tracking problematic queries
 */
export class HeavyQueryDto {
  @ApiProperty({ description: 'The SQL query text (statement)' })
  query_text: string;

  @ApiPropertyOptional({ description: 'Full SQL text including batch' })
  full_text?: string;

  @ApiProperty({ description: 'Number of times this query has been executed' })
  execution_count: number;

  @ApiProperty({ description: 'Total CPU time in milliseconds' })
  total_cpu_ms: number;

  @ApiProperty({ description: 'Average CPU time per execution in milliseconds' })
  avg_cpu_ms: number;

  @ApiProperty({ description: 'Total elapsed time in milliseconds' })
  total_duration_ms: number;

  @ApiProperty({ description: 'Average elapsed time per execution in milliseconds' })
  avg_duration_ms: number;

  @ApiProperty({ description: 'Total logical reads (pages read from cache)' })
  total_logical_reads: number;

  @ApiProperty({ description: 'Total logical writes (pages written)' })
  total_logical_writes: number;

  @ApiProperty({ description: 'Total physical reads (pages read from disk)' })
  total_physical_reads: number;

  @ApiProperty({ description: 'Timestamp of last execution' })
  last_execution_time: Date;

  @ApiPropertyOptional({ description: 'Timestamp when query plan was created' })
  creation_time?: Date;

  @ApiPropertyOptional({ description: 'Plan handle for execution plan lookup' })
  plan_handle?: string;

  @ApiPropertyOptional({ description: 'SQL handle for query identification' })
  sql_handle?: string;

  @ApiPropertyOptional({ description: 'Database name where query was executed' })
  database_name?: string | null;

  @ApiPropertyOptional({ description: 'Object name (stored procedure, function, etc.)' })
  object_name?: string | null;

  @ApiProperty({
    description: 'Query source identification: SANKHYA, SYSTEM, or EXTERNAL',
    enum: ['SANKHYA', 'SYSTEM', 'EXTERNAL'],
  })
  query_source: 'SANKHYA' | 'SYSTEM' | 'EXTERNAL';

  @ApiProperty({
    description: 'Severity classification based on resource consumption',
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
  })
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  @ApiProperty({ description: 'Calculated cost score for ranking' })
  cost_score: number;
}
