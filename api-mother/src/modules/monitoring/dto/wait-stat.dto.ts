import { ApiProperty } from '@nestjs/swagger';

/**
 * Wait statistics from sys.dm_os_wait_stats
 */
export class WaitStatDto {
  @ApiProperty({ description: 'Type of wait (e.g., PAGEIOLATCH_SH, LCK_M_S, etc.)' })
  wait_type: string;

  @ApiProperty({ description: 'Number of tasks that encountered this wait' })
  waiting_tasks_count: number;

  @ApiProperty({ description: 'Total wait time in milliseconds' })
  wait_time_ms: number;

  @ApiProperty({ description: 'Maximum single wait time in milliseconds' })
  max_wait_time_ms: number;

  @ApiProperty({ description: 'Signal wait time (time waiting for CPU) in milliseconds' })
  signal_wait_time_ms: number;

  @ApiProperty({ description: 'Resource wait time (wait_time_ms - signal_wait_time_ms)' })
  resource_wait_time_ms: number;

  @ApiProperty({ description: 'Average wait time per task in milliseconds' })
  avg_wait_time_ms: number;
}
