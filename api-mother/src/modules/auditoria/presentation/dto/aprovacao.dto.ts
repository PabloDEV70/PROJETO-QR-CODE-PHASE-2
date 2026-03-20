/**
 * DTOs de Aprovacao
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsObject, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export enum TipoOperacaoAprovacaoEnum {
  INSERT = 'I',
  UPDATE = 'U',
  DELETE = 'D',
}

export enum StatusAprovacaoEnum {
  PENDENTE = 'P',
  APROVADA = 'A',
  REJEITADA = 'R',
  EXPIRADA = 'E',
  CANCELADA = 'C',
}

export enum PrioridadeAprovacaoEnum {
  ALTA = 'A',
  NORMAL = 'N',
  BAIXA = 'B',
}

// Request DTOs
export class SolicitarAprovacaoDto {
  @ApiProperty({ description: 'Codigo do usuario solicitante', example: 1 })
  @IsNumber()
  codUsuario: number;

  @ApiPropertyOptional({ description: 'Codigo do aprovador especifico' })
  @IsNumber()
  @IsOptional()
  codAprovador?: number;

  @ApiProperty({ description: 'Nome da tabela', example: 'AD_RDOAPONTAMENTOS' })
  @IsString()
  tabela: string;

  @ApiProperty({ description: 'Tipo de operacao', enum: TipoOperacaoAprovacaoEnum })
  @IsEnum(TipoOperacaoAprovacaoEnum)
  operacao: TipoOperacaoAprovacaoEnum;

  @ApiProperty({ description: 'Dados da operacao' })
  @IsObject()
  dados: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Chave do registro', example: 'ID=123' })
  @IsString()
  @IsOptional()
  chaveRegistro?: string;

  @ApiPropertyOptional({ description: 'Observacao do solicitante' })
  @IsString()
  @IsOptional()
  observacao?: string;

  @ApiPropertyOptional({ description: 'Prioridade', enum: PrioridadeAprovacaoEnum, default: 'N' })
  @IsEnum(PrioridadeAprovacaoEnum)
  @IsOptional()
  prioridade?: PrioridadeAprovacaoEnum;

  @ApiPropertyOptional({ description: 'Dias para expirar', default: 7 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(30)
  @Type(() => Number)
  diasParaExpirar?: number;
}

export class ProcessarAprovacaoDto {
  @ApiProperty({ description: 'Codigo do aprovador', example: 1 })
  @IsNumber()
  codAprovador: number;

  @ApiPropertyOptional({ description: 'Motivo de rejeicao (obrigatorio se rejeitar)' })
  @IsString()
  @IsOptional()
  motivoRejeicao?: string;

  @ApiPropertyOptional({ description: 'Observacao do aprovador' })
  @IsString()
  @IsOptional()
  observacao?: string;
}

export class ListarAprovacoesQueryDto {
  @ApiPropertyOptional({ description: 'Codigo do aprovador' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  codAprovador?: number;

  @ApiPropertyOptional({ description: 'Nome da tabela' })
  @IsString()
  @IsOptional()
  tabela?: string;

  @ApiPropertyOptional({ description: 'Tipo de operacao', enum: TipoOperacaoAprovacaoEnum })
  @IsEnum(TipoOperacaoAprovacaoEnum)
  @IsOptional()
  operacao?: TipoOperacaoAprovacaoEnum;

  @ApiPropertyOptional({ description: 'Status', enum: StatusAprovacaoEnum, default: 'P' })
  @IsEnum(StatusAprovacaoEnum)
  @IsOptional()
  status?: StatusAprovacaoEnum;

  @ApiPropertyOptional({ description: 'Pagina', default: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  pagina?: number;

  @ApiPropertyOptional({ description: 'Limite por pagina', default: 50 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  limite?: number;
}

// Response DTOs
export class AprovacaoRespostaDto {
  @ApiProperty({ description: 'ID da aprovacao' })
  aprovacaoId: number;

  @ApiProperty({ description: 'Codigo do usuario solicitante' })
  codUsuario: number;

  @ApiPropertyOptional({ description: 'Codigo do aprovador' })
  codAprovador?: number | null;

  @ApiProperty({ description: 'Nome da tabela' })
  tabela: string;

  @ApiProperty({ description: 'Tipo de operacao' })
  operacao: string;

  @ApiProperty({ description: 'Descricao da operacao' })
  descricaoOperacao: string;

  @ApiPropertyOptional({ description: 'Dados da operacao' })
  dados?: Record<string, unknown> | null;

  @ApiPropertyOptional({ description: 'Chave do registro' })
  chaveRegistro?: string | null;

  @ApiProperty({ description: 'Status' })
  status: string;

  @ApiProperty({ description: 'Descricao do status' })
  descricaoStatus: string;

  @ApiProperty({ description: 'Data da solicitacao' })
  dataSolicitacao: Date;

  @ApiPropertyOptional({ description: 'Data de expiracao' })
  dataExpiracao?: Date | null;

  @ApiPropertyOptional({ description: 'Horas restantes ate expirar' })
  horasRestantes?: number | null;

  @ApiPropertyOptional({ description: 'Observacao do solicitante' })
  observacaoSolicitante?: string | null;

  @ApiProperty({ description: 'Prioridade' })
  prioridade: string;

  @ApiProperty({ description: 'Descricao da prioridade' })
  descricaoPrioridade: string;
}

export class ListaAprovacaoRespostaDto {
  @ApiProperty({ description: 'Lista de aprovacoes', type: [AprovacaoRespostaDto] })
  aprovacoes: AprovacaoRespostaDto[];

  @ApiProperty({ description: 'Total de registros' })
  total: number;

  @ApiProperty({ description: 'Pagina atual' })
  pagina: number;

  @ApiProperty({ description: 'Limite por pagina' })
  limite: number;

  @ApiProperty({ description: 'Total de paginas' })
  totalPaginas: number;
}

export class SolicitarAprovacaoRespostaDto {
  @ApiProperty({ description: 'ID da aprovacao criada' })
  aprovacaoId: number;

  @ApiProperty({ description: 'Status da solicitacao' })
  status: string;

  @ApiProperty({ description: 'Data da solicitacao' })
  dataSolicitacao: Date;

  @ApiPropertyOptional({ description: 'Data de expiracao' })
  dataExpiracao?: Date | null;

  @ApiProperty({ description: 'Mensagem' })
  mensagem: string;
}

export class ProcessarAprovacaoRespostaDto {
  @ApiProperty({ description: 'ID da aprovacao' })
  aprovacaoId: number;

  @ApiProperty({ description: 'Novo status' })
  status: string;

  @ApiProperty({ description: 'Descricao do status' })
  descricaoStatus: string;

  @ApiProperty({ description: 'Data do processamento' })
  dataProcessamento: Date;

  @ApiProperty({ description: 'Foi processado' })
  processado: boolean;

  @ApiProperty({ description: 'Mensagem' })
  mensagem: string;
}

export class EstatisticasAprovacaoRespostaDto {
  @ApiProperty({ description: 'Total pendentes' })
  totalPendentes: number;

  @ApiProperty({ description: 'Total aprovadas' })
  totalAprovadas: number;

  @ApiProperty({ description: 'Total rejeitadas' })
  totalRejeitadas: number;

  @ApiProperty({ description: 'Total expiradas' })
  totalExpiradas: number;

  @ApiProperty({ description: 'Total canceladas' })
  totalCanceladas: number;
}

export class ExpirarAprovacoesRespostaDto {
  @ApiProperty({ description: 'Total de aprovacoes expiradas' })
  totalExpiradas: number;

  @ApiProperty({ description: 'Data de execucao' })
  dataExecucao: Date;

  @ApiProperty({ description: 'Mensagem' })
  mensagem: string;
}
