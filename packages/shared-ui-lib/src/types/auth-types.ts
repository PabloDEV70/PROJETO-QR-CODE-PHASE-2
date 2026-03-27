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
  nomegrupo?: string;
}

export interface StandardLoginPayload {
  username: string;
  password: string;
  turnstileToken?: string;
}

export interface ColaboradorLoginPayload {
  codparc: number;
  cpf: string;
  turnstileToken?: string;
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
  nome: string;
  nomecompleto: string | null;
  codparc: number | null;
  codgrupo: number | null;
  codemp: number | null;
  codfunc: number | null;
  pertencedp: string | null;
  nomegrupo: string | null;
}
