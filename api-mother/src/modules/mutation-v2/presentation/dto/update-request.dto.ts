import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsObject, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class UpdateRequestDto {
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
    description: 'Condição WHERE como objeto (campo: valor)',
    example: { PLACA: 'TST-0001' },
  })
  @IsObject()
  condicao: Record<string, unknown>;

  @ApiProperty({
    description: 'Novos valores para os campos',
    example: { TAG: 'ATUALIZADO', ATIVO: 'S' },
  })
  @IsObject()
  dadosNovos: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Limite máximo de registros a atualizar (segurança)',
    default: 10,
    maximum: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limiteRegistros?: number = 10;

  @ApiPropertyOptional({
    description: 'Simular operação sem executar (dry-run)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean = false;
}
