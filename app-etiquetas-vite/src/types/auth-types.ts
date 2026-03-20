export type DatabaseEnv = 'PROD' | 'TESTE' | 'TREINA';

export interface AuthUser {
  token: string;
  refreshToken?: string;
  type: 'standard' | 'colaborador';
  username?: string;
  codparc?: number;
  codusu?: number;
  nome?: string;
  codgrupo?: number;
  codemp?: number;
  codfunc?: number;
  pertencedp?: string;
}

export interface StandardLoginPayload {
  username: string;
  password: string;
}

export interface ColaboradorLoginPayload {
  codparc: number;
  cpf: string;
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
