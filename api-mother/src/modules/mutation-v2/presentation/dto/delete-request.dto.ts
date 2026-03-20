import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsObject, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class DeleteRequestDto {
  @ApiProperty({
    description: 'Nome da tabela (ex: TGFVEI)',
    example: 'TGFVEI',
  })
  @IsString()
  @Matches(/^[A-Z][A-Z0-9_]{2,29}$/i, {
    message: 'Nome da tabela deve ter entre 3-30 caracteres alfanuméricos',
  })
  nomeTabela: string;

  @ApiProperty({
    description: 'Condição WHERE como objeto (OBRIGATÓRIA)',
    example: { PLACA: 'TST-0001' },
  })
  @IsObject()
  condicao: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Limite máximo de registros a excluir (segurança)',
    default: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  limiteRegistros?: number = 1;

  @ApiPropertyOptional({
    description: 'Excluir permanentemente (false = soft delete com ATIVO=N)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hardDelete?: boolean = false;

  @ApiPropertyOptional({
    description: 'Simular operação sem executar (dry-run)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean = false;
}
