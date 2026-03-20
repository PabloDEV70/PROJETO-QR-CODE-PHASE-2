import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString, Matches } from 'class-validator';

export class InsertRequestDto {
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
    description: 'Dados a serem inseridos (campo: valor)',
    example: { PLACA: 'TST-0001', ATIVO: 'S', TAG: 'TESTE-API-V2' },
  })
  @IsObject()
  dados: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Validar chaves estrangeiras antes de inserir',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  validarFKs?: boolean = true;

  @ApiPropertyOptional({
    description: 'Simular operação sem executar (dry-run)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean = false;
}
