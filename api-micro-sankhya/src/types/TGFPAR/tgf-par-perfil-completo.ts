import { TgfParPapeis } from './tgf-par-papeis';
import { TgfParEndereco } from './tgf-par-endereco';
import { TgfParContato } from './tgf-par-contato';
import { TfpFunHistorico } from '../TFPFUN/tfp-fun-historico';

export interface TgfParUsuario {
  codusu: number;
  nomeusu: string;
}

export interface TgfParPerfilCompleto {
  codparc: number;
  nomeparc: string;
  cgcCpf: string;
  cgcCpfFormatted: string;
  tippessoa: 'F' | 'J';
  ativo: 'S' | 'N';
  razaosocial: string | null;
  papeis: TgfParPapeis;
  endereco: TgfParEndereco;
  contato: TgfParContato;
  dtcad: string | null;
  dtalter: string | null;
  limcred: number | null;
  bloquear: 'S' | 'N' | null;
  vinculosCount: number;
  usuarioSistema: TgfParUsuario | null;
  funcionario?: TfpFunHistorico;
}
