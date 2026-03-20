import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para resposta de execução de query
 */
export class QueryResponseDto {
  @ApiProperty({
    description: 'Linhas retornadas pela query',
    example: [
      { CODPROD: 123, DESCRPROD: 'Produto Exemplo' },
      { CODPROD: 124, DESCRPROD: 'Outro Produto' },
    ],
  })
  linhas: any[];

  @ApiProperty({
    description: 'Quantidade total de linhas retornadas',
    example: 2,
  })
  quantidadeLinhas: number;

  @ApiProperty({
    description: 'Tempo de execução em milissegundos',
    example: 45,
  })
  tempoExecucaoMs: number;

  @ApiProperty({
    description: 'Nomes das colunas retornadas',
    example: ['CODPROD', 'DESCRPROD'],
    required: false,
  })
  colunas?: string[];

  @ApiProperty({
    description: 'Indica se há resultados',
    example: true,
  })
  possuiResultados: boolean;
}
