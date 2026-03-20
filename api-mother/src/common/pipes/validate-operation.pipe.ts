/**
 * ValidateOperationPipe - Valida operacao CRUD antes da execucao.
 *
 * @module M3-T12
 *
 * Este pipe valida os parametros da operacao CRUD antes de passar para
 * o handler, garantindo que os dados estao no formato correto.
 *
 * @example
 * @UsePipes(ValidateOperationPipe)
 * @Post()
 * async criarVeiculo(@Body() dto: CriarVeiculoDto) { }
 */
import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException, Logger } from '@nestjs/common';
import { OperacaoCrud } from '../guards/types';

export interface OperacaoValidada {
  operacao: OperacaoCrud;
  tabela: string;
  campos?: string[];
  dados?: Record<string, any>;
}

export interface ConfiguracaoValidacao {
  operacoesPermitidas?: OperacaoCrud[];
  tabelasPermitidas?: string[];
  camposObrigatorios?: string[];
  camposProibidos?: string[];
  tamanhoMaximoDados?: number;
  validarFormatoCampos?: boolean;
}

@Injectable()
export class ValidateOperationPipe implements PipeTransform {
  private readonly logger = new Logger(ValidateOperationPipe.name);
  private readonly configuracao: ConfiguracaoValidacao;

  constructor(configuracao?: ConfiguracaoValidacao) {
    this.configuracao = {
      operacoesPermitidas: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LIST'],
      tamanhoMaximoDados: 1024 * 1024, // 1MB
      validarFormatoCampos: true,
      ...configuracao,
    };
  }

  transform(valor: any, metadata: ArgumentMetadata): any {
    // Se nao for body ou query, retornar sem validacao
    if (metadata.type !== 'body' && metadata.type !== 'query') {
      return valor;
    }

    // Se valor for nulo ou undefined, retornar
    if (valor === null || valor === undefined) {
      return valor;
    }

    // Se for objeto, validar
    if (typeof valor === 'object') {
      return this.validarObjeto(valor, metadata);
    }

    return valor;
  }

  /**
   * Valida um objeto de dados.
   */
  private validarObjeto(objeto: Record<string, any>, metadata: ArgumentMetadata): Record<string, any> {
    // Validar tamanho
    this.validarTamanho(objeto);

    // Validar operacao se presente
    if (objeto.operacao) {
      this.validarOperacao(objeto.operacao);
    }

    // Validar tabela se presente
    if (objeto.tabela) {
      this.validarTabela(objeto.tabela);
    }

    // Validar campos obrigatorios
    this.validarCamposObrigatorios(objeto);

    // Validar campos proibidos
    this.validarCamposProibidos(objeto);

    // Validar formato de campos se configurado
    if (this.configuracao.validarFormatoCampos) {
      this.validarFormatoCampos(objeto);
    }

    // Sanitizar dados
    const objetoSanitizado = this.sanitizarDados(objeto);

    this.logger.debug(`Operacao validada: ${metadata.type} com ${Object.keys(objetoSanitizado).length} campos`);

    return objetoSanitizado;
  }

  /**
   * Valida o tamanho do objeto.
   */
  private validarTamanho(objeto: Record<string, any>): void {
    const tamanho = JSON.stringify(objeto).length;
    const tamanhoMaximo = this.configuracao.tamanhoMaximoDados!;

    if (tamanho > tamanhoMaximo) {
      throw new BadRequestException(`Dados excedem o tamanho maximo permitido de ${tamanhoMaximo} bytes`);
    }
  }

  /**
   * Valida se a operacao e permitida.
   */
  private validarOperacao(operacao: string): void {
    const operacoesPermitidas = this.configuracao.operacoesPermitidas!;

    if (!operacoesPermitidas.includes(operacao as OperacaoCrud)) {
      throw new BadRequestException(
        `Operacao '${operacao}' nao e permitida. Operacoes validas: ${operacoesPermitidas.join(', ')}`,
      );
    }
  }

  /**
   * Valida se a tabela e permitida.
   */
  private validarTabela(tabela: string): void {
    const tabelasPermitidas = this.configuracao.tabelasPermitidas;

    if (tabelasPermitidas && !tabelasPermitidas.includes(tabela.toUpperCase())) {
      throw new BadRequestException(`Tabela '${tabela}' nao e permitida para esta operacao`);
    }

    // Validar formato do nome da tabela (apenas letras, numeros e underscore)
    if (!/^[A-Z][A-Z0-9_]*$/i.test(tabela)) {
      throw new BadRequestException(`Nome da tabela '${tabela}' contem caracteres invalidos`);
    }
  }

  /**
   * Valida se todos os campos obrigatorios estao presentes.
   */
  private validarCamposObrigatorios(objeto: Record<string, any>): void {
    const camposObrigatorios = this.configuracao.camposObrigatorios;

    if (!camposObrigatorios || camposObrigatorios.length === 0) {
      return;
    }

    const camposFaltantes = camposObrigatorios.filter(
      (campo) => !(campo in objeto) || objeto[campo] === undefined || objeto[campo] === null,
    );

    if (camposFaltantes.length > 0) {
      throw new BadRequestException(`Campos obrigatorios faltando: ${camposFaltantes.join(', ')}`);
    }
  }

  /**
   * Valida se nao ha campos proibidos.
   */
  private validarCamposProibidos(objeto: Record<string, any>): void {
    const camposProibidos = this.configuracao.camposProibidos;

    if (!camposProibidos || camposProibidos.length === 0) {
      return;
    }

    const camposEncontrados = camposProibidos.filter((campo) => campo in objeto);

    if (camposEncontrados.length > 0) {
      throw new BadRequestException(`Campos proibidos encontrados: ${camposEncontrados.join(', ')}`);
    }
  }

  /**
   * Valida formato dos campos.
   */
  private validarFormatoCampos(objeto: Record<string, any>): void {
    for (const [chave, valor] of Object.entries(objeto)) {
      // Validar nome do campo
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(chave)) {
        throw new BadRequestException(`Nome do campo '${chave}' contem caracteres invalidos`);
      }

      // Validar tipo do valor (prevenir objetos complexos em campos simples)
      if (valor !== null && typeof valor === 'object' && !Array.isArray(valor)) {
        // Permitir objetos aninhados apenas se forem dados estruturados
        const keysValidas = Object.keys(valor).every((k) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k));

        if (!keysValidas) {
          throw new BadRequestException(`Objeto no campo '${chave}' contem chaves invalidas`);
        }
      }
    }
  }

  /**
   * Sanitiza os dados removendo caracteres perigosos.
   */
  private sanitizarDados(objeto: Record<string, any>): Record<string, any> {
    const resultado: Record<string, any> = {};

    for (const [chave, valor] of Object.entries(objeto)) {
      if (typeof valor === 'string') {
        // Remover caracteres de controle (exceto newline e tab)
        resultado[chave] = valor.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      } else if (Array.isArray(valor)) {
        resultado[chave] = valor.map((item) =>
          typeof item === 'string' ? item.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') : item,
        );
      } else if (typeof valor === 'object' && valor !== null) {
        resultado[chave] = this.sanitizarDados(valor);
      } else {
        resultado[chave] = valor;
      }
    }

    return resultado;
  }
}

/**
 * Factory para criar ValidateOperationPipe com configuracao customizada.
 */
export function criarValidateOperationPipe(configuracao: ConfiguracaoValidacao): ValidateOperationPipe {
  return new ValidateOperationPipe(configuracao);
}
