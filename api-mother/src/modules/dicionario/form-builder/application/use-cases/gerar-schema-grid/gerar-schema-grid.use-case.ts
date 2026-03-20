import { Injectable, Inject } from '@nestjs/common';
import { IRepositorioCampo, REPOSITORIO_CAMPO } from '../../../../domain/repositories/campo.repository.interface';
import { Campo } from '../../../../domain/entities/campo.entity';
import { IGridSchema, IColunaGridSchema } from '../../../domain/interfaces';
import { GerarSchemaGridInput } from './gerar-schema-grid.input';
import { GerarSchemaGridOutput } from './gerar-schema-grid.output';

@Injectable()
export class GerarSchemaGridUseCase {
  constructor(
    @Inject(REPOSITORIO_CAMPO)
    private readonly repositorioCampo: IRepositorioCampo,
  ) {}

  async executar(entrada: GerarSchemaGridInput): Promise<GerarSchemaGridOutput> {
    const nomeTabela = entrada.nomeTabela.toUpperCase();

    const campos = await this.repositorioCampo.buscarPorTabela(nomeTabela, entrada.tokenUsuario);

    if (!campos || campos.length === 0) {
      throw new Error(`Nenhum campo encontrado para a tabela ${nomeTabela}`);
    }

    const colunas = this.construirColunas(campos, entrada);

    const schema: IGridSchema = {
      tableName: nomeTabela,
      title: entrada.titulo || this.formatarTitulo(nomeTabela),
      description: entrada.descricao,
      columns: colunas,
      config: {
        pageable: entrada.permitirPaginacao ?? true,
        pageSize: entrada.tamanhoPagina || 20,
        pageSizeOptions: [10, 20, 50, 100],
        selectable: true,
        selectionMode: 'multiple',
        exportable: true,
        exportFormats: ['csv', 'excel'],
      },
      metadata: {
        primaryKey: campos.find((c) => c.chavePrimaria)?.nomeCampo,
      },
    };

    return { schema };
  }

  private construirColunas(campos: Campo[], entrada: GerarSchemaGridInput): IColunaGridSchema[] {
    return campos
      .filter((campo) => {
        if (entrada.excluirCampos?.includes(campo.nomeCampo)) return false;
        if (!entrada.incluirCamposOcultos && !campo.ehVisivel()) return false;
        return true;
      })
      .map((campo, index) => ({
        field: campo.nomeCampo,
        header: campo.descricao || campo.nomeCampo,
        type: campo.tipo.valor,
        sortable: true,
        filterable: true,
        editable: !campo.chavePrimaria,
        visible: campo.ehVisivel(),
        order: index,
        isPrimaryKey: campo.chavePrimaria,
        align: campo.tipo.ehNumerico() ? 'right' : 'left',
      }));
  }

  private formatarTitulo(nomeTabela: string): string {
    return nomeTabela.replace(/^(TGF|TCF|TSI|AD_)/, '');
  }
}
