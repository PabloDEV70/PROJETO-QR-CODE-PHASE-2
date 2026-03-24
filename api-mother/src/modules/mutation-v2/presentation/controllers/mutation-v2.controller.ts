import { Body, Controller, Delete, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MutationEnabledGuard } from '../../../../security/mutation-enabled.guard';
import { TabelaProtegidaGuard } from '../../../../security/tabela-protegida.guard';
import { InserirRegistroUseCase } from '../../application/use-cases/inserir-registro';
import { AtualizarRegistroUseCase } from '../../application/use-cases/atualizar-registro';
import { ExcluirRegistroUseCase } from '../../application/use-cases/excluir-registro';
import { InsertRequestDto, UpdateRequestDto, DeleteRequestDto, MutationResponseDto } from '../dto';

@ApiTags('Mutation V2')
@ApiBearerAuth()
@Controller('v2/mutation')
@UseGuards(AuthGuard('jwt'), MutationEnabledGuard, TabelaProtegidaGuard)
export class MutationV2Controller {
  constructor(
    private readonly inserirRegistroUseCase: InserirRegistroUseCase,
    private readonly atualizarRegistroUseCase: AtualizarRegistroUseCase,
    private readonly excluirRegistroUseCase: ExcluirRegistroUseCase,
  ) {}

  @Post('insert')
  @ApiOperation({
    summary: 'Inserir registro',
    description: 'Insere um novo registro na tabela especificada. Requer autenticação JWT e ambiente TESTE.',
  })
  @ApiResponse({ status: 201, description: 'Registro inserido com sucesso', type: MutationResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Operação não permitida (ambiente ou tabela protegida)' })
  async inserir(@Body() dto: InsertRequestDto, @Req() req: any) {
    const resultado = await this.inserirRegistroUseCase.executar({
      nomeTabela: dto.nomeTabela,
      dados: dto.dados,
      validarFKs: dto.validarFKs,
      dryRun: dto.dryRun,
      usuario: req.user?.username || req.user?.sub || 'unknown',
    });

    return {
      foiSucesso: resultado.foiSucesso(),
      sucesso: resultado.sucesso,
      tipo: resultado.tipo,
      nomeTabela: resultado.nomeTabela,
      registrosAfetados: resultado.registrosAfetados,
      mensagem: resultado.mensagem,
      dadosInseridos: resultado.dadosInseridos || undefined,
      tempoExecucao: resultado.tempoExecucao || undefined,
      dryRun: resultado.dryRun,
    };
  }

  @Put('update')
  @ApiOperation({
    summary: 'Atualizar registro(s)',
    description:
      'Atualiza registro(s) na tabela especificada. Condição WHERE é obrigatória. Limite padrão: 10 registros.',
  })
  @ApiResponse({ status: 200, description: 'Registro(s) atualizado(s) com sucesso', type: MutationResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou condição não fornecida' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Operação não permitida' })
  async atualizar(@Body() dto: UpdateRequestDto, @Req() req: any) {
    const resultado = await this.atualizarRegistroUseCase.executar({
      nomeTabela: dto.nomeTabela,
      condicao: dto.condicao,
      dadosNovos: dto.dadosNovos,
      limiteRegistros: dto.limiteRegistros,
      dryRun: dto.dryRun,
      usuario: req.user?.username || req.user?.sub || 'unknown',
    });

    return {
      foiSucesso: resultado.foiSucesso(),
      sucesso: resultado.sucesso,
      tipo: resultado.tipo,
      nomeTabela: resultado.nomeTabela,
      registrosAfetados: resultado.registrosAfetados,
      mensagem: resultado.mensagem,
      dadosAntigos: resultado.dadosAntigos || undefined,
      tempoExecucao: resultado.tempoExecucao || undefined,
      dryRun: resultado.dryRun,
    };
  }

  @Delete('delete')
  @ApiOperation({
    summary: 'Excluir registro(s) (soft delete)',
    description:
      'Exclui registro(s) da tabela. Por padrão usa soft delete (ATIVO=N). Condição WHERE é OBRIGATÓRIA. Limite padrão: 1 registro.',
  })
  @ApiResponse({ status: 200, description: 'Registro(s) excluído(s) com sucesso', type: MutationResponseDto })
  @ApiResponse({ status: 400, description: 'Condição não fornecida' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Operação não permitida' })
  async excluir(@Body() dto: DeleteRequestDto, @Req() req: any) {
    const resultado = await this.excluirRegistroUseCase.executar({
      nomeTabela: dto.nomeTabela,
      condicao: dto.condicao,
      limiteRegistros: dto.limiteRegistros,
      hardDelete: dto.hardDelete,
      dryRun: dto.dryRun,
      usuario: req.user?.username || req.user?.sub || 'unknown',
    });

    return {
      foiSucesso: resultado.foiSucesso(),
      sucesso: resultado.sucesso,
      tipo: resultado.tipo,
      nomeTabela: resultado.nomeTabela,
      registrosAfetados: resultado.registrosAfetados,
      mensagem: resultado.mensagem,
      dadosAntigos: resultado.dadosAntigos || undefined,
      tempoExecucao: resultado.tempoExecucao || undefined,
      dryRun: resultado.dryRun,
    };
  }
}
