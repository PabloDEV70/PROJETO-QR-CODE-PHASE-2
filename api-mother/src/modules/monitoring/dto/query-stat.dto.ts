import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Query execution statistics from sys.dm_exec_query_stats
 * Extended with user, host, program, and source identification
 */
export class QueryStatDto {
  @ApiProperty({ description: 'The SQL query text' })
  query_text: string;

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

  @ApiPropertyOptional({ description: 'Number of plan regenerations' })
  plan_generation_num?: number;

  @ApiPropertyOptional({ description: 'Plan handle for execution plan lookup' })
  plan_handle?: string;

  @ApiPropertyOptional({ description: 'SQL handle for query identification' })
  sql_handle?: string;

  @ApiPropertyOptional({ description: 'Database name where query was executed' })
  database_name?: string | null;

  @ApiPropertyOptional({ description: 'Database ID' })
  database_id?: number | null;

  @ApiPropertyOptional({ description: 'Object name (stored procedure, function, etc.)' })
  object_name?: string | null;

  @ApiPropertyOptional({ description: 'Last login name that executed the query' })
  last_login_name?: string | null;

  @ApiPropertyOptional({ description: 'Last host name that executed the query' })
  last_host_name?: string | null;

  @ApiPropertyOptional({ description: 'Last program name that executed the query' })
  last_program_name?: string | null;

  @ApiPropertyOptional({ description: 'Last client IP address' })
  last_client_ip?: string | null;

  @ApiProperty({
    description: 'Query source identification: SANKHYA, SYSTEM, or EXTERNAL',
    enum: ['SANKHYA', 'SYSTEM', 'EXTERNAL'],
  })
  query_source: 'SANKHYA' | 'SYSTEM' | 'EXTERNAL';

  @ApiProperty({ description: 'Calculated cost score for ranking' })
  cost_score: number;
}
