import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Session information from sys.dm_exec_sessions
 */
export class SessionStatDto {
  @ApiProperty({ description: 'Session ID' })
  session_id: number;

  @ApiProperty({ description: 'Login timestamp' })
  login_time: Date;

  @ApiPropertyOptional({ description: 'Client machine name' })
  host_name?: string | null;

  @ApiPropertyOptional({ description: 'Application/program name' })
  program_name?: string | null;

  @ApiProperty({ description: 'Login name' })
  login_name: string;

  @ApiProperty({ description: 'Session status' })
  status: string;

  @ApiProperty({ description: 'CPU time consumed in milliseconds' })
  cpu_time: number;

  @ApiProperty({ description: 'Memory usage in 8KB pages' })
  memory_usage: number;

  @ApiProperty({ description: 'Total scheduled time in milliseconds' })
  total_scheduled_time: number;

  @ApiProperty({ description: 'Total elapsed time in milliseconds' })
  total_elapsed_time: number;

  @ApiPropertyOptional({ description: 'Last request start time' })
  last_request_start_time?: Date | null;

  @ApiPropertyOptional({ description: 'Last request end time' })
  last_request_end_time?: Date | null;

  @ApiProperty({ description: 'Number of reads' })
  reads: number;

  @ApiProperty({ description: 'Number of writes' })
  writes: number;

  @ApiProperty({ description: 'Number of logical reads' })
  logical_reads: number;

  @ApiPropertyOptional({ description: 'Current database name' })
  database_name?: string | null;

  @ApiPropertyOptional({ description: 'Client network address' })
  client_net_address?: string | null;

  @ApiPropertyOptional({ description: 'Connection reads' })
  connection_reads?: number | null;

  @ApiPropertyOptional({ description: 'Connection writes' })
  connection_writes?: number | null;
}
