export type DatabaseEnv = 'PROD' | 'TESTE' | 'TREINA';

export interface AuthUser {
  token: string;
  refreshToken?: string;
  type: 'standard' | 'colaborador';
  username?: string;
  codparc?: number;
  codusu?: number;
  nome?: string;
  nomecompleto?: string;
  codgrupo?: number;
  codemp?: number;
  codfunc?: number;
  pertencedp?: string;
  cargo?: string;
  nomegrupo?: string;
  codcargahor?: number;
}

export interface StandardLoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  type: 'standard' | 'colaborador';
  username?: string;
  codparc?: number;
  requiresTotp?: boolean;
  totpToken?: string;
}

export interface MeResponse {
  codusu: number;
  codparc: number;
  nome: string;
  nomecompleto?: string;
  codgrupo?: number;
  codemp?: number;
  nomegrupo?: string;
}
