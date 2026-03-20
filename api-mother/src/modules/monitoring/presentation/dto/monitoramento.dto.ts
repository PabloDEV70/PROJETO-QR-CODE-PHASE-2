/**
 * DTOs de Monitoramento
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PermissoesResponseDto {
  @ApiProperty({ example: true })
  hasViewServerState!: boolean;

  @ApiProperty({ example: true })
  hasViewDatabaseState!: boolean;
}

export class VisaoServidorResponseDto {
  @ApiProperty({ example: 'Microsoft SQL Server 2019' })
  versaoSql!: string;

  @ApiProperty({ example: 'SQL-PROD' })
  nomeServidor!: string;

  @ApiProperty({ example: 'SANKHYA_PROD' })
  bancoAtual!: string;

  @ApiProperty({ example: 45 })
  sessoesUsuarioAtivas!: number;

  @ApiProperty({ example: 12 })
  requisicaosAtivas!: number;

  @ApiProperty({ example: 45 })
  conexoesUsuario!: number;

  @ApiProperty({ example: '2026-01-26T23:30:00Z' })
  horaServidor!: Date;
}

export class EstatisticasQueryResponseDto {
  @ApiProperty({ example: 1500 })
  contagemExecucoes!: number;

  @ApiProperty({ example: 45000 })
  cpuTotalMs!: number;

  @ApiProperty({ example: 30 })
  cpuMedioMs!: number;

  @ApiProperty({ example: 120000 })
  duracaoTotalMs!: number;

  @ApiProperty({ example: 80 })
  duracaoMediaMs!: number;

  @ApiProperty({ example: 500000 })
  leiturasLogicasTotais!: number;

  @ApiProperty({ example: 'SELECT * FROM TGFPRO...' })
  textoQuery!: string;

  @ApiPropertyOptional({ example: 'SANKHYA_PROD' })
  nomeBancoDados?: string;

  @ApiProperty({ example: 'SANKHYA' })
  fonteQuery!: string;

  @ApiProperty({ example: 5500.5 })
  pontuacaoCusto!: number;
}

export class QueryAtivaResponseDto {
  @ApiProperty({ example: 55 })
  idSessao!: number;

  @ApiProperty({ example: 'running' })
  status!: string;

  @ApiProperty({ example: 'SELECT' })
  comando!: string;

  @ApiProperty({ example: 1500 })
  tempoCpu!: number;

  @ApiProperty({ example: 5000 })
  tempoTotalDecorrido!: number;

  @ApiPropertyOptional({ example: 'LCK_M_S' })
  tipoEspera?: string;

  @ApiPropertyOptional({ example: 56 })
  idSessaoBloqueadora?: number;

  @ApiProperty({ example: 'SANKHYA_PROD' })
  nomeBancoDados!: string;

  @ApiProperty({ example: 'SELECT * FROM...' })
  textoQuery!: string;
}

export class EstatisticaEsperaResponseDto {
  @ApiProperty({ example: 'LCK_M_S' })
  tipoEspera!: string;

  @ApiProperty({ example: 1500 })
  contagemTarefasEsperando!: number;

  @ApiProperty({ example: 45000 })
  tempoEsperaMs!: number;

  @ApiProperty({ example: 5000 })
  tempoMaximoEsperaMs!: number;

  @ApiProperty({ example: 30 })
  tempoMedioEsperaMs!: number;
}

export class SessaoAtivaResponseDto {
  @ApiProperty({ example: 55 })
  idSessao!: number;

  @ApiProperty({ example: '2026-01-26T10:00:00Z' })
  horaLogin!: Date;

  @ApiPropertyOptional({ example: 'WORKSTATION-01' })
  nomeHost?: string;

  @ApiPropertyOptional({ example: 'Sankhya MGE' })
  nomePrograma?: string;

  @ApiProperty({ example: 'sa' })
  nomeLogin!: string;

  @ApiProperty({ example: 'sleeping' })
  status!: string;

  @ApiProperty({ example: 15000 })
  tempoCpu!: number;

  @ApiProperty({ example: 50000 })
  leiturasLogicas!: number;

  @ApiPropertyOptional({ example: '192.168.1.100' })
  enderecoClienteRede?: string;
}

export class MetadataResponseDto {
  @ApiProperty({ example: 50 })
  count!: number;

  @ApiPropertyOptional({ example: 50 })
  limit?: number;

  @ApiProperty({ example: 125 })
  executionTimeMs!: number;

  @ApiProperty({ example: '2026-01-26T23:30:00Z' })
  timestamp!: string;
}
