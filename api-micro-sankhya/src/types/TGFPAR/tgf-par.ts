export interface TgfPar {
  codparc: number;
  nomeparc: string;
  cgcCpf: string;
  cgcCpfFormatted?: string;
  tippessoa: 'F' | 'J';
  ativo: 'S' | 'N';
  razaosocial?: string;
  cliente: 'S' | 'N';
  fornecedor: 'S' | 'N';
  motorista: 'S' | 'N';
  vendedor: 'S' | 'N';
  funcionario?: 'S' | 'N';
  usuario?: 'S' | 'N';
  comprador?: 'S' | 'N';
}
