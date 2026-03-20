import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ControlePermissaoRespostaDto {
  @ApiProperty({ example: 'btnSalvar' })
  nomeControle: string;

  @ApiProperty({ example: true })
  habilitado: boolean;

  @ApiProperty({ example: true })
  visivel: boolean;

  @ApiProperty({ example: false })
  obrigatorio: boolean;

  @ApiProperty({ example: false })
  somenteLeitura: boolean;

  @ApiProperty({ example: true })
  acessivel: boolean;

  @ApiProperty({ example: true })
  permiteEdicao: boolean;
}

export class PermissoesTelaRespostaDto {
  @ApiProperty({ example: 1 })
  codUsuario: number;

  @ApiProperty({ example: 100 })
  codTela: number;

  @ApiProperty({ type: [ControlePermissaoRespostaDto] })
  controles: ControlePermissaoRespostaDto[];

  @ApiProperty({ example: 5 })
  total: number;
}

export class ParametroRespostaDto {
  @ApiProperty({ example: 'MOSTRA_GRID' })
  chave: string;

  @ApiProperty({ example: 'S' })
  valor: string;

  @ApiProperty({ example: 'B' })
  tipo: string;

  @ApiPropertyOptional({ example: 'Mostrar grid na tela inicial' })
  descricao?: string;

  @ApiProperty({ example: true })
  valorBooleano: boolean;

  @ApiProperty({ example: 0 })
  valorNumerico: number;
}

export class ParametrosUsuarioRespostaDto {
  @ApiProperty({ example: 1 })
  codUsuario: number;

  @ApiProperty({ type: [ParametroRespostaDto] })
  parametros: ParametroRespostaDto[];

  @ApiProperty({ example: 10 })
  total: number;
}

export class VerificarAcessoRespostaDto {
  @ApiProperty({ example: 1 })
  codUsuario: number;

  @ApiProperty({ example: 100 })
  codTela: number;

  @ApiProperty({ example: 'btnSalvar' })
  nomeControle: string;

  @ApiProperty({ example: true })
  temAcesso: boolean;
}
