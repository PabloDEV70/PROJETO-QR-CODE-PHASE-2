import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Active query information from sys.dm_exec_requests
 */
export class ActiveQueryDto {
  @ApiProperty({ description: 'Session ID executing this query' })
  session_id: number;

  @ApiProperty({ description: 'Query execution status (running, suspended, etc.)' })
  status: string;

  @ApiProperty({ description: 'Command type (SELECT, INSERT, etc.)' })
  command: string;

  @ApiProperty({ description: 'The SQL query text' })
  query_text: string;

  @ApiProperty({ description: 'CPU time consumed in milliseconds' })
  cpu_time: number;

  @ApiProperty({ description: 'Total elapsed time in milliseconds' })
  total_elapsed_time: number;

  @ApiPropertyOptional({ description: 'Current wait type (if waiting)' })
  wait_type?: string | null;

  @ApiProperty({ description: 'Wait time in milliseconds' })
  wait_time: number;

  @ApiPropertyOptional({ description: 'Session ID that is blocking this query (if blocked)' })
  blocking_session_id?: number | null;

  @ApiProperty({ description: 'Number of open transactions' })
  open_transaction_count: number;

  @ApiProperty({ description: 'Database ID' })
  database_id: number;

  @ApiPropertyOptional({ description: 'Database name' })
  database_name?: string;
}
