import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class McpDictionaryListDto {
  @ApiPropertyOptional({ description: 'Limite de resultados', default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @ApiPropertyOptional({ description: 'Offset para paginação', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class McpDictionaryTableDto {
  @ApiProperty({ description: 'Nome da tabela', example: 'TGFPAR' })
  @IsString()
  tableName: string;

  @ApiPropertyOptional({ description: 'Limite de campos', default: 500 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 500;

  @ApiPropertyOptional({ description: 'Offset para paginação', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class McpDictionaryFieldDto {
  @ApiProperty({ description: 'Nome da tabela', example: 'TGFPAR' })
  @IsString()
  tableName: string;

  @ApiProperty({ description: 'Nome do campo', example: 'CODPARC' })
  @IsString()
  fieldName: string;
}

export class McpDictionarySearchDto {
  @ApiProperty({ description: 'Termo de busca', example: 'PARCEIRO' })
  @IsString()
  term: string;

  @ApiPropertyOptional({ description: 'Limite de resultados', default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  limit?: number = 100;

  @ApiPropertyOptional({ description: 'Offset para paginação', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class McpDictionaryFieldSearchDto {
  @ApiProperty({ description: 'Termo de busca', example: 'CODPARC' })
  @IsString()
  term: string;

  @ApiPropertyOptional({ description: 'Limite de resultados', default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  limit?: number = 100;

  @ApiPropertyOptional({ description: 'Offset para paginação', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class McpDictionaryResponseDto<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  metadata?: {
    executionTime: number;
    timestamp: string;
    database: string;
  };
}

export class TableInfoDto {
  NOMETAB: string;
  DESCRTAB: string;
  TIPONUMERACAO: string;
  NUCAMPONUMERACAO: number;
  ADICIONAL?: string;
}

export class TableDetailDto {
  NOMETAB: string;
  DESCRTAB: string;
  TIPONUMERACAO: string;
  NUCAMPONUMERACAO: number;
  ADICIONAL?: string;
}

export class FieldInfoDto {
  NUCAMPO: number;
  NOMETAB: string;
  NOMECAMPO: string;
  DESCRCAMPO: string;
  TIPCAMPO: string;
  TIPOAPRESENTACAO?: string;
  TAMANHO?: number;
  MASCARA?: string;
  PERMITEPESQUISA?: string;
  CALCULADO?: string;
}

export class FieldDetailDto {
  NUCAMPO: number;
  NOMETAB: string;
  NOMECAMPO: string;
  DESCRCAMPO: string;
  TIPCAMPO: string;
  TIPOAPRESENTACAO?: string;
  TAMANHO?: number;
  MASCARA?: string;
  EXPRESSAO?: string;
  PERMITEPESQUISA?: string;
  CALCULADO?: string;
  PERMITEPADRAO?: string;
  APRESENTACAO?: string;
  ORDEM?: number;
  VISIVELGRIDPESQUISA?: string;
  SISTEMA?: string;
  CONTROLE?: string;
  QTD_OPCOES?: number;
}

export class FieldOptionDto {
  NUCAMPO: number;
  CODOPC?: number;
  DESCROPC?: string;
  CODATU?: number;
  VLRMAX?: number;
}

export class FieldPropertyDto {
  NUCAMPO: number;
  NOMETAB: string;
  NOMECAMPO: string;
  REQUERIDO: boolean;
  READONLY: boolean;
  VISIVEL: boolean;
  EDITAVEL: boolean;
  VISIVELGRID: boolean;
}

export class InstanceInfoDto {
  NUINST: number;
  NOMEINST: string;
  DESCRINST: string;
}

export class RelationshipInfoDto {
  NUINSTORIG: number;
  NOMEINSTORIG: string;
  DESCRINSTORIG: string;
  NUINSTDEST: number;
  NOMEINSTDEST: string;
  DESCRINSTDEST: string;
  TIPLIGACAO: string;
  NOMELIGACAO?: string;
  EXPRESSAO?: string;
  OBRIGATORIA: string;
  CONDICAO?: string;
}

export class McpDictionaryToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}
