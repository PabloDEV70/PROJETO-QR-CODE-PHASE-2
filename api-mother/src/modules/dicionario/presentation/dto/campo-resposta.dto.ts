import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de resposta para representação de um campo do dicionário de dados.
 *
 * Mapeia os dados da entidade Campo para o formato de resposta da API.
 */
export class CampoRespostaDto {
  @ApiProperty({
    description: 'Nome da tabela à qual o campo pertence',
    example: 'TGFPAR',
  })
  nomeTabela: string;

  @ApiProperty({
    description: 'Nome do campo',
    example: 'CODPARC',
  })
  nomeCampo: string;

  @ApiProperty({
    description: 'Nome completo do campo (tabela.campo)',
    example: 'TGFPAR.CODPARC',
  })
  nomeCompleto: string;

  @ApiProperty({
    description: 'Descrição do campo',
    example: 'Código do Parceiro',
  })
  descricao: string;

  @ApiProperty({
    description: 'Tipo do campo (C=Caractere, N=Numérico, D=Data, etc.)',
    example: 'N',
    enum: ['C', 'N', 'D', 'T', 'M', 'B', 'I', 'F'],
  })
  tipo: string;

  @ApiProperty({
    description: 'Descrição legível do tipo do campo',
    example: 'Numérico',
  })
  tipoDescricao: string;

  @ApiProperty({
    description: 'Tamanho máximo do campo',
    example: 10,
  })
  tamanho: number;

  @ApiProperty({
    description: 'Número de casas decimais (para campos numéricos)',
    example: 2,
  })
  decimais: number;

  @ApiProperty({
    description: 'Indica se o campo é obrigatório',
    example: true,
  })
  obrigatorio: boolean;

  @ApiProperty({
    description: 'Indica se o campo é chave primária',
    example: true,
  })
  chavePrimaria: boolean;

  @ApiProperty({
    description: 'Indica se o campo é chave estrangeira',
    example: false,
  })
  chaveEstrangeira: boolean;

  @ApiProperty({
    description: 'Indica se o campo é chave (primária ou estrangeira)',
    example: true,
  })
  ehChave: boolean;

  @ApiPropertyOptional({
    description: 'Tipo de apresentação do campo',
    example: 'E',
  })
  apresentacao: string | null;

  @ApiPropertyOptional({
    description: 'Valor padrão do campo',
    example: '0',
  })
  valorPadrao: string;

  @ApiProperty({
    description: 'Indica se o campo é visível na interface',
    example: true,
  })
  ehVisivel: boolean;
}

/**
 * DTO para listagem paginada de campos.
 */
export class ListaCamposRespostaDto {
  @ApiProperty({
    description: 'Lista de campos',
    type: [CampoRespostaDto],
  })
  campos: CampoRespostaDto[];

  @ApiProperty({
    description: 'Total de registros disponíveis',
    example: 50,
  })
  total: number;
}
