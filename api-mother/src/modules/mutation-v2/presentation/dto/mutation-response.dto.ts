import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MutationResponseDto {
  @ApiProperty({ description: 'Operação bem sucedida', example: true })
  sucesso: boolean;

  @ApiProperty({ description: 'Tipo da operação', example: 'INSERT' })
  tipo: string;

  @ApiProperty({ description: 'Tabela afetada', example: 'TGFVEI' })
  nomeTabela: string;

  @ApiProperty({ description: 'Quantidade de registros afetados', example: 1 })
  registrosAfetados: number;

  @ApiProperty({ description: 'Mensagem descritiva', example: 'Operação realizada com sucesso' })
  mensagem: string;

  @ApiPropertyOptional({ description: 'Dados inseridos (apenas INSERT)' })
  dadosInseridos?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Dados antes da alteração (UPDATE/DELETE)' })
  dadosAntigos?: Record<string, unknown>[];

  @ApiPropertyOptional({ description: 'Tempo de execução em ms', example: 45 })
  tempoExecucao?: number;

  @ApiPropertyOptional({ description: 'Foi apenas simulação', example: false })
  dryRun?: boolean;
}
