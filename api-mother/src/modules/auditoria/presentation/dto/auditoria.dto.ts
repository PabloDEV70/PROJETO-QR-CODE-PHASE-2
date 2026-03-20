/**
 * DTOs de Auditoria
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsDateString, IsObject, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export enum TipoOperacaoEnum {
  INSERT = 'I',
  UPDATE = 'U',
  DELETE = 'D',
  SELECT = 'S',
}

export enum StatusSucessoEnum {
  SIM = 'S',
  NAO = 'N',
}

export enum FormatoExportacaoEnum {
  JSON = 'json',
  CSV = 'csv',
}

// Request DTOs
export class RegistrarOperacaoDto {
  @ApiProperty({ description: 'Codigo do usuario', example: 1 })
  @IsNumber()
  codUsuario: number;

  @ApiProperty({ description: 'Nome da tabela', example: 'AD_RDOAPONTAMENTOS' })
  @IsString()
  tabela: string;

  @ApiProperty({ description: 'Tipo de operacao', enum: TipoOperacaoEnum })
  @IsEnum(TipoOperacaoEnum)
  operacao: TipoOperacaoEnum;

  @ApiPropertyOptional({ description: 'Dados antes da operacao' })
  @IsObject()
  @IsOptional()
  dadosAntigos?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Dados apos a operacao' })
  @IsObject()
  @IsOptional()
  dadosNovos?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Chave do registro', example: 'ID=123' })
  @IsString()
  @IsOptional()
  chaveRegistro?: string;

  @ApiPropertyOptional({ description: 'Observacao adicional' })
  @IsString()
  @IsOptional()
  observacao?: string;

  @ApiPropertyOptional({ description: 'Operacao foi sucesso', default: true })
  @IsBoolean()
  @IsOptional()
  sucesso?: boolean;

  @ApiPropertyOptional({ description: 'Mensagem de erro se falhou' })
  @IsString()
  @IsOptional()
  mensagemErro?: string;
}

export class ConsultarHistoricoQueryDto {
  @ApiPropertyOptional({ description: 'Codigo do usuario' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  codUsuario?: number;

  @ApiPropertyOptional({ description: 'Nome da tabela' })
  @IsString()
  @IsOptional()
  tabela?: string;

  @ApiPropertyOptional({ description: 'Tipo de operacao', enum: TipoOperacaoEnum })
  @IsEnum(TipoOperacaoEnum)
  @IsOptional()
  operacao?: TipoOperacaoEnum;

  @ApiPropertyOptional({ description: 'Data inicio (ISO 8601)', example: '2026-01-01' })
  @IsDateString()
  @IsOptional()
  dataInicio?: string;

  @ApiPropertyOptional({ description: 'Data fim (ISO 8601)', example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  dataFim?: string;

  @ApiPropertyOptional({ description: 'Sucesso', enum: StatusSucessoEnum })
  @IsEnum(StatusSucessoEnum)
  @IsOptional()
  sucesso?: StatusSucessoEnum;

  @ApiPropertyOptional({ description: 'Chave do registro (busca parcial)' })
  @IsString()
  @IsOptional()
  chaveRegistro?: string;

  @ApiPropertyOptional({ description: 'Pagina', default: 1, minimum: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  pagina?: number;

  @ApiPropertyOptional({ description: 'Limite por pagina', default: 50, minimum: 1, maximum: 200 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  limite?: number;
}

export class ExportarHistoricoQueryDto {
  @ApiPropertyOptional({ description: 'Nome da tabela' })
  @IsString()
  @IsOptional()
  tabela?: string;

  @ApiPropertyOptional({ description: 'Tipo de operacao', enum: TipoOperacaoEnum })
  @IsEnum(TipoOperacaoEnum)
  @IsOptional()
  operacao?: TipoOperacaoEnum;

  @ApiPropertyOptional({ description: 'Data inicio (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  dataInicio?: string;

  @ApiPropertyOptional({ description: 'Data fim (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  dataFim?: string;

  @ApiProperty({ description: 'Formato de exportacao', enum: FormatoExportacaoEnum, default: 'json' })
  @IsEnum(FormatoExportacaoEnum)
  formato: FormatoExportacaoEnum;

  @ApiPropertyOptional({ description: 'Limite de registros', default: 1000, maximum: 10000 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10000)
  @Type(() => Number)
  limite?: number;
}

// Response DTOs
export class RegistroAuditoriaRespostaDto {
  @ApiProperty({ description: 'ID do registro de auditoria' })
  auditoriaId: number;

  @ApiProperty({ description: 'Codigo do usuario' })
  codUsuario: number;

  @ApiProperty({ description: 'Nome da tabela' })
  tabela: string;

  @ApiProperty({ description: 'Tipo de operacao' })
  operacao: string;

  @ApiProperty({ description: 'Descricao da operacao' })
  descricaoOperacao: string;

  @ApiPropertyOptional({ description: 'Dados antes da operacao' })
  dadosAntigos?: Record<string, unknown> | null;

  @ApiPropertyOptional({ description: 'Dados apos a operacao' })
  dadosNovos?: Record<string, unknown> | null;

  @ApiPropertyOptional({ description: 'Diferencas entre dados' })
  diferencas?: Record<string, { antigo: unknown; novo: unknown }> | null;

  @ApiProperty({ description: 'Data e hora da operacao' })
  dataHora: Date;

  @ApiPropertyOptional({ description: 'IP de origem' })
  ip?: string | null;

  @ApiPropertyOptional({ description: 'Chave do registro' })
  chaveRegistro?: string | null;

  @ApiProperty({ description: 'Operacao foi sucesso' })
  sucesso: boolean;

  @ApiPropertyOptional({ description: 'Mensagem de erro' })
  mensagemErro?: string | null;
}

export class ListaAuditoriaRespostaDto {
  @ApiProperty({ description: 'Lista de registros', type: [RegistroAuditoriaRespostaDto] })
  registros: RegistroAuditoriaRespostaDto[];

  @ApiProperty({ description: 'Total de registros' })
  total: number;

  @ApiProperty({ description: 'Pagina atual' })
  pagina: number;

  @ApiProperty({ description: 'Limite por pagina' })
  limite: number;

  @ApiProperty({ description: 'Total de paginas' })
  totalPaginas: number;
}

export class EstatisticasAuditoriaRespostaDto {
  @ApiProperty({ description: 'Total de registros' })
  totalRegistros: number;

  @ApiProperty({ description: 'Total de inserts' })
  totalInserts: number;

  @ApiProperty({ description: 'Total de updates' })
  totalUpdates: number;

  @ApiProperty({ description: 'Total de deletes' })
  totalDeletes: number;

  @ApiProperty({ description: 'Total de selects' })
  totalSelects: number;

  @ApiProperty({ description: 'Total de sucessos' })
  totalSucessos: number;

  @ApiProperty({ description: 'Total de falhas' })
  totalFalhas: number;

  @ApiProperty({ description: 'Taxa de sucesso (%)' })
  taxaSucesso: number;
}
