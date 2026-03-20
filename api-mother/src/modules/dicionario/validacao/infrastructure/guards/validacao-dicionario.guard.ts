import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ValidacaoService } from '../../application/services/validacao.service';
import { VALIDAR_VIA_DICIONARIO_KEY } from '../decorators/validar-via-dicionario.decorator';

/**
 * Guard para validação de requisições via dicionário.
 *
 * Intercepta requisições marcadas com @ValidarViaDicionario e valida
 * o body contra o schema da tabela no dicionário Sankhya.
 */
@Injectable()
export class ValidacaoDicionarioGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly validacaoService: ValidacaoService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Verificar se endpoint requer validação
    const nomeTabela = this.reflector.get<string>(VALIDAR_VIA_DICIONARIO_KEY, context.getHandler());

    if (!nomeTabela) {
      // Sem decorador, permitir passagem
      return true;
    }

    // 2. Extrair body da requisição
    const request = context.switchToHttp().getRequest();
    const dados = request.body;

    if (!dados || typeof dados !== 'object') {
      throw new BadRequestException('Body da requisição inválido ou ausente');
    }

    // 3. Validar dados
    const resultado = await this.validacaoService.validarDados(nomeTabela, dados);

    if (resultado.falhou) {
      throw new BadRequestException({
        mensagem: 'Validação via dicionário falhou',
        erros: resultado.erro,
        tabela: nomeTabela,
      });
    }

    // 4. Permitir continuação
    return true;
  }
}
