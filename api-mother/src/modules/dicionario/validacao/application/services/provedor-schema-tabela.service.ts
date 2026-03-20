import { Injectable, Inject } from '@nestjs/common';
import { IProvedorSchemaTabela, SchemaTabela } from '../../domain/interfaces/schema-tabela.interface';
import { REPOSITORIO_CAMPO, IRepositorioCampo } from '../../../domain/repositories/campo.repository.interface';

/**
 * Provedor de schemas de tabelas com cache em memória.
 *
 * Carrega metadados de campos via repositório e cacheia para performance.
 */
@Injectable()
export class ProvedorSchemaTabelaService implements IProvedorSchemaTabela {
  private cache: Map<string, SchemaTabela> = new Map();

  constructor(
    @Inject(REPOSITORIO_CAMPO)
    private readonly campoRepository: IRepositorioCampo,
  ) {}

  async obterSchema(nomeTabela: string): Promise<SchemaTabela> {
    const nomeNormalizado = nomeTabela.toUpperCase();

    // Verificar cache
    if (this.cache.has(nomeNormalizado)) {
      return this.cache.get(nomeNormalizado)!;
    }

    // Carregar do repositório (usar token vazio por ora, ajustar depois)
    const campos = await this.campoRepository.buscarPorTabela(nomeNormalizado, '');

    // Construir schema
    const camposMap = new Map();
    const camposObrigatorios: string[] = [];
    const camposChavePrimaria: string[] = [];

    for (const campo of campos) {
      camposMap.set(campo.nomeCampo, campo);

      if (campo.obrigatorio) {
        camposObrigatorios.push(campo.nomeCampo);
      }

      if (campo.chavePrimaria) {
        camposChavePrimaria.push(campo.nomeCampo);
      }
    }

    const schema: SchemaTabela = {
      nomeTabela: nomeNormalizado,
      campos: camposMap,
      camposObrigatorios,
      camposChavePrimaria,
      versao: new Date().toISOString(),
    };

    // Cachear
    this.cache.set(nomeNormalizado, schema);

    return schema;
  }

  limparCache(nomeTabela?: string): void {
    if (nomeTabela) {
      this.cache.delete(nomeTabela.toUpperCase());
    } else {
      this.cache.clear();
    }
  }
}
