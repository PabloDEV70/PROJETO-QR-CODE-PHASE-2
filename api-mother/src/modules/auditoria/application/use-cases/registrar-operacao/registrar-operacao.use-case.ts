/**
 * Use Case: RegistrarOperacao
 *
 * Registra uma operacao no historico de auditoria.
 */

import { Injectable, Inject } from '@nestjs/common';
import { REPOSITORIO_AUDITORIA, IAuditoriaRepository } from '../../../domain/repositories';
import { RegistroAuditoria, TipoOperacao, StatusSucesso } from '../../../domain/entities';

export interface RegistrarOperacaoInput {
  codUsuario: number;
  tabela: string;
  operacao: TipoOperacao;
  dadosAntigos?: Record<string, unknown> | null;
  dadosNovos?: Record<string, unknown> | null;
  ip?: string;
  userAgent?: string;
  chaveRegistro?: string;
  observacao?: string;
  sucesso?: boolean;
  mensagemErro?: string;
}

export interface RegistrarOperacaoOutput {
  auditoriaId: number;
  registrado: boolean;
  dataHora: Date;
}

@Injectable()
export class RegistrarOperacaoUseCase {
  constructor(
    @Inject(REPOSITORIO_AUDITORIA)
    private readonly repositorio: IAuditoriaRepository,
  ) {}

  async executar(input: RegistrarOperacaoInput): Promise<RegistrarOperacaoOutput> {
    const dataHora = new Date();
    const sucesso: StatusSucesso = input.sucesso === false ? 'N' : 'S';

    const registro = RegistroAuditoria.criar({
      codUsuario: input.codUsuario,
      tabela: input.tabela,
      operacao: input.operacao,
      dadosAntigos: input.dadosAntigos ? JSON.stringify(input.dadosAntigos) : null,
      dadosNovos: input.dadosNovos ? JSON.stringify(input.dadosNovos) : null,
      dataHora,
      ip: input.ip || null,
      userAgent: input.userAgent || null,
      chaveRegistro: input.chaveRegistro || null,
      observacao: input.observacao || null,
      sucesso,
      mensagemErro: input.mensagemErro || null,
    });

    const auditoriaId = await this.repositorio.inserir(registro);

    return {
      auditoriaId,
      registrado: true,
      dataHora,
    };
  }
}
