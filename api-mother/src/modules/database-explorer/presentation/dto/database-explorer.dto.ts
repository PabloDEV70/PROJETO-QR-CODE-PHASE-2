/**
 * DTOs: Database Explorer V2
 *
 * DTOs para endpoints de exploração do banco de dados.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// ====================
// Query DTOs
// ====================

export class PaginacaoQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar por nome do schema/esquema',
    example: 'SANKHYA',
  })
  @IsOptional()
  @IsString()
  schema?: string;

  @ApiPropertyOptional({
    description: 'Quantidade máxima de resultados por página',
    example: 100,
    default: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  limite?: number;

  @ApiPropertyOptional({
    description: 'Número de registros a pular (paginação)',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({
    description: 'Truncar definições SQL longas para 500 caracteres',
    example: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  truncar?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir código SQL de definição',
    example: true,
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => value !== 'false' && value !== false)
  @IsBoolean()
  incluirDefinicao?: boolean;
}

// ====================
// Response DTOs
// ====================

export class ResumoDatabaseResponseDto {
  @ApiProperty({ description: 'Quantidade de tabelas', example: 150 })
  totalTabelas: number;

  @ApiProperty({ description: 'Quantidade de views', example: 45 })
  totalViews: number;

  @ApiProperty({ description: 'Quantidade de triggers', example: 20 })
  totalTriggers: number;

  @ApiProperty({ description: 'Quantidade de stored procedures', example: 80 })
  totalProcedures: number;

  @ApiProperty({ description: 'Tamanho total do banco em MB', example: 1024.5 })
  tamanhoTotalMb: number;

  @ApiProperty({ description: 'Tamanho dos dados em MB', example: 800.25 })
  tamanhoDadosMb: number;

  @ApiProperty({ description: 'Tamanho dos índices em MB', example: 200.25 })
  tamanhoIndicesMb: number;

  @ApiProperty({ description: 'Espaço não utilizado em MB', example: 24.0 })
  tamanhoNaoUsadoMb: number;
}

export class ViewResponseDto {
  @ApiProperty({ description: 'Nome do schema', example: 'dbo' })
  schema: string;

  @ApiProperty({ description: 'Nome da view', example: 'vw_Veiculos' })
  nome: string;

  @ApiPropertyOptional({ description: 'Definição SQL da view' })
  definicao?: string | null;
}

export class ColunaViewResponseDto {
  @ApiProperty({ description: 'Nome da coluna', example: 'CODPROD' })
  nome: string;

  @ApiProperty({ description: 'Tipo de dados', example: 'int' })
  tipo: string;

  @ApiProperty({ description: 'Permite nulo', example: false })
  nulo: boolean;

  @ApiProperty({ description: 'Posição ordinal', example: 1 })
  posicao: number;

  @ApiPropertyOptional({ description: 'Tamanho máximo', example: 255 })
  tamanhoMaximo?: number;

  @ApiPropertyOptional({ description: 'Precisão numérica', example: 18 })
  precisao?: number;

  @ApiPropertyOptional({ description: 'Escala numérica', example: 2 })
  escala?: number;
}

export class ViewDetalheResponseDto extends ViewResponseDto {
  @ApiProperty({ description: 'Colunas da view', type: [ColunaViewResponseDto] })
  colunas: ColunaViewResponseDto[];
}

export class TriggerResponseDto {
  @ApiProperty({ description: 'Nome do schema', example: 'dbo' })
  schema: string;

  @ApiProperty({ description: 'Nome do trigger', example: 'tr_Audit_Veiculo' })
  nome: string;

  @ApiProperty({ description: 'Tabela associada', example: 'TGFVEI' })
  tabela: string;

  @ApiProperty({ description: 'Descrição do tipo', example: 'AFTER' })
  tipoDescricao: string;

  @ApiProperty({ description: 'Trigger desabilitado', example: false })
  desabilitado: boolean;

  @ApiPropertyOptional({ description: 'Definição SQL do trigger' })
  definicao?: string | null;
}

export class TriggerDetalheResponseDto extends TriggerResponseDto {
  @ApiProperty({ description: 'Eventos que disparam o trigger', example: ['INSERT', 'UPDATE'] })
  eventos: string[];
}

export class ProcedureResponseDto {
  @ApiProperty({ description: 'Nome do schema', example: 'dbo' })
  schema: string;

  @ApiProperty({ description: 'Nome da procedure', example: 'sp_BuscarVeiculo' })
  nome: string;

  @ApiProperty({ description: 'Descrição do tipo', example: 'SQL_STORED_PROCEDURE' })
  tipoDescricao: string;

  @ApiPropertyOptional({ description: 'Data de criação' })
  dataCriacao?: Date | null;

  @ApiPropertyOptional({ description: 'Data de modificação' })
  dataModificacao?: Date | null;

  @ApiPropertyOptional({ description: 'Definição SQL da procedure' })
  definicao?: string | null;
}

export class ParametroProcedureResponseDto {
  @ApiProperty({ description: 'Nome do parâmetro', example: '@CodVeiculo' })
  nome: string;

  @ApiProperty({ description: 'Tipo de dados', example: 'int' })
  tipo: string;

  @ApiPropertyOptional({ description: 'Tamanho máximo', example: 255 })
  tamanhoMaximo?: number;

  @ApiPropertyOptional({ description: 'Precisão numérica', example: 18 })
  precisao?: number;

  @ApiPropertyOptional({ description: 'Escala numérica', example: 2 })
  escala?: number;

  @ApiProperty({ description: 'É parâmetro de saída', example: false })
  saida: boolean;
}

export class ProcedureDetalheResponseDto extends ProcedureResponseDto {
  @ApiProperty({ description: 'Parâmetros da procedure', type: [ParametroProcedureResponseDto] })
  parametros: ParametroProcedureResponseDto[];
}

export class RelacionamentoResponseDto {
  @ApiProperty({ description: 'Nome da constraint', example: 'FK_Veiculo_Parceiro' })
  nomeConstraint: string;

  @ApiProperty({ description: 'Schema da tabela pai', example: 'dbo' })
  schemaPai: string;

  @ApiProperty({ description: 'Tabela pai', example: 'TGFVEI' })
  tabelaPai: string;

  @ApiProperty({ description: 'Coluna pai', example: 'CODPARC' })
  colunaPai: string;

  @ApiProperty({ description: 'Schema da tabela referenciada', example: 'dbo' })
  schemaReferenciado: string;

  @ApiProperty({ description: 'Tabela referenciada', example: 'TGFPAR' })
  tabelaReferenciada: string;

  @ApiProperty({ description: 'Coluna referenciada', example: 'CODPARC' })
  colunaReferenciada: string;

  @ApiProperty({ description: 'Regra de delete', example: 'NO_ACTION' })
  regraDelete: string;

  @ApiProperty({ description: 'Regra de update', example: 'NO_ACTION' })
  regraUpdate: string;
}

export class EstatisticasCacheResponseDto {
  @ApiProperty({ description: 'Acertos de cache', example: 150 })
  acertos: number;

  @ApiProperty({ description: 'Erros de cache', example: 25 })
  erros: number;

  @ApiProperty({ description: 'Quantidade de chaves no cache', example: 45 })
  chaves: number;

  @ApiProperty({ description: 'Tamanho das chaves em bytes', example: 2048 })
  tamanhoChaves: number;

  @ApiProperty({ description: 'Tamanho dos valores em bytes', example: 102400 })
  tamanhoValores: number;

  @ApiProperty({ description: 'Taxa de acerto (%)', example: 85 })
  taxaAcerto: number;

  @ApiProperty({ description: 'Tamanho total formatado', example: '102 KB' })
  tamanhoFormatado: string;
}

// ====================
// Wrapper Response
// ====================

export class MetadataResponseDto {
  @ApiPropertyOptional({ description: 'Total de registros', example: 100 })
  total?: number;

  @ApiPropertyOptional({ description: 'Limite por página', example: 100 })
  limite?: number;

  @ApiPropertyOptional({ description: 'Offset atual', example: 0 })
  offset?: number;

  @ApiPropertyOptional({ description: 'Tempo de execução em ms', example: 45 })
  tempoExecucao?: number;
}

export class ApiResponseWrapperDto<T> {
  @ApiProperty({ description: 'Indica sucesso da operação', example: true })
  sucesso: boolean;

  @ApiProperty({ description: 'Dados retornados' })
  dados: T;

  @ApiPropertyOptional({ description: 'Metadados da resposta', type: MetadataResponseDto })
  metadata?: MetadataResponseDto;
}
