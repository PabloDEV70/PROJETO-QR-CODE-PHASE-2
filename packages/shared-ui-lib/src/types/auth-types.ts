export interface User {
  id: number;
  nome: string;
  email: string;
  tipoFuncionario: string;
  urlFoto?: string;
  funcao?: string;
  idFuncao?: number;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  database?: string;
}

export interface AuthState {
  user: User | null;
  token: Token | null;
  isAuthenticated: boolean;
  database: string | null;
}

export interface LoginResponse {
  token: Token;
  user: User;
}

export interface TotpSetupResponse {
  secret: string;
  qrCode: string;
}

export interface TotpVerifyRequest {
  code: string;
}

export interface Database {
  name: string;
  alias: string;
}
