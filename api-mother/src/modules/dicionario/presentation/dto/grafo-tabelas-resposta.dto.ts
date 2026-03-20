import { ApiProperty } from '@nestjs/swagger';

/**
 * D4-T09: DTO para nodo do grafo de tabelas
 */
export class NodoTabelaGrafoRespostaDto {
  @ApiProperty({
    description: 'Nome da tabela',
    example: 'TGFPAR',
  })
  nomeTabela: string;

  @ApiProperty({
    description: 'Descrição da tabela',
    example: 'Cadastro de Parceiros',
  })
  descricao: string;

  @ApiProperty({
    description: 'Nível de distância da tabela central (0 = central)',
    example: 0,
  })
  nivel: number;
}

/**
 * D4-T09: DTO para aresta do grafo (relacionamento)
 */
export class ArestaRelacionamentoRespostaDto {
  @ApiProperty({
    description: 'Tabela de origem',
    example: 'TGFPAR',
  })
  tabelaOrigem: string;

  @ApiProperty({
    description: 'Tabela de destino',
    example: 'TGFCON',
  })
  tabelaDestino: string;

  @ApiProperty({
    description: 'Nome da instância pai',
    example: 'Parceiro',
  })
  nomeInstanciaPai: string;

  @ApiProperty({
    description: 'Nome da instância filha',
    example: 'Contato',
  })
  nomeInstanciaFilho: string;

  @ApiProperty({
    description: 'Tipo de ligação',
    example: 'M',
  })
  tipoLigacao: string;

  @ApiProperty({
    description: 'Descrição do tipo de ligação',
    example: 'Master-Detail',
  })
  tipoLigacaoDescricao: string;

  @ApiProperty({
    description: 'Indica se é master-detail',
    example: true,
  })
  ehMasterDetail: boolean;
}

/**
 * D4-T09: DTO para resposta de grafo de tabelas relacionadas
 */
export class GrafoTabelasRespostaDto {
  @ApiProperty({
    description: 'Tabela central do grafo',
    example: 'TGFPAR',
  })
  tabelaCentral: string;

  @ApiProperty({
    description: 'Nodos do grafo (tabelas)',
    type: [NodoTabelaGrafoRespostaDto],
  })
  nodos: NodoTabelaGrafoRespostaDto[];

  @ApiProperty({
    description: 'Arestas do grafo (relacionamentos)',
    type: [ArestaRelacionamentoRespostaDto],
  })
  arestas: ArestaRelacionamentoRespostaDto[];

  @ApiProperty({
    description: 'Total de tabelas no grafo',
    example: 5,
  })
  totalTabelas: number;

  @ApiProperty({
    description: 'Total de relacionamentos',
    example: 8,
  })
  totalRelacionamentos: number;

  @ApiProperty({
    description: 'Profundidade máxima alcançada',
    example: 2,
  })
  profundidade: number;
}
