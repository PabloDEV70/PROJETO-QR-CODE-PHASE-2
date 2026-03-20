/**
 * Dados de entrada do caso de uso GerarSchemaFormulario.
 *
 * @module FormBuilder
 */
export interface GerarSchemaFormularioInput {
  /**
   * Token JWT do usuário autenticado.
   */
  tokenUsuario: string;

  /**
   * Nome da tabela para gerar o formulário.
   */
  nomeTabela: string;

  /**
   * Título do formulário (opcional, padrão: nome da tabela formatado).
   */
  titulo?: string;

  /**
   * Descrição do formulário.
   */
  descricao?: string;

  /**
   * Se deve incluir campos ocultos.
   */
  incluirCamposOcultos?: boolean;

  /**
   * Se deve incluir chaves primárias.
   */
  incluirChavesPrimarias?: boolean;

  /**
   * Campos a serem excluídos do formulário.
   */
  excluirCampos?: string[];

  /**
   * Se deve ordenar campos alfabeticamente.
   */
  ordenarAlfabeticamente?: boolean;
}
