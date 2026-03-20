/**
 * Tipos para o endpoint GET /funcionarios/:codparc/perfil-enriquecido
 * Retorna dados completos do funcionário incluindo:
 * - Dados pessoais (TGFPAR)
 * - Endereço completo
 * - Papéis no sistema (funcionário, usuário, cliente, fornecedor)
 * - Dados de usuário sistema (TSIUSU) se existir
 * - Vínculo atual ou mais recente (funciona para QUALQUER situação)
 * - Histórico de vínculos
 */

export interface FuncionarioEndereco {
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cep: string | null;
  cidade: string | null;
  uf: string | null;
}

export interface FuncionarioPapeis {
  funcionario: boolean;
  usuario: boolean;
  cliente: boolean;
  fornecedor: boolean;
}

export interface FuncionarioUsuarioSistema {
  codusu: number;
  nomeusu: string;
  emailUsuario: string | null;
  ativo: boolean; // Calculado a partir de DTLIMACESSO (NULL ou data futura = ativo)
}

export interface FuncionarioVinculoAtual {
  codemp: number;
  codfunc: number;
  situacao: string;
  situacaoLabel: string;
  dtadm: string;
  dtdem: string | null;
  cargo: string | null;
  funcao: string | null;
  departamento: string | null;
  empresa: string | null;
  salario: number | null;
  coddep: number | null;
  codcargo: number | null;
  codfuncao: number | null;
  codcargahor: number | null;
}

export interface FuncionarioVinculoResumo {
  codemp: number;
  codfunc: number;
  situacao: string;
  situacaoLabel: string;
  dtadm: string;
  dtdem: string | null;
  cargo: string | null;
  empresa: string | null;
}

export interface FuncionarioHistorico {
  totalVinculos: number;
  vinculos: FuncionarioVinculoResumo[];
}

export interface FuncionarioCargaTurno {
  entrada: string; // formato HH:MM
  saida: string;   // formato HH:MM
  minutos: number;
}

export interface FuncionarioCargaDia {
  diasem: number;
  diasemLabel: string;
  minutosPrevistos: number;
  folga: boolean;
  turnos: FuncionarioCargaTurno[];
}

export interface FuncionarioCargaHoraria {
  codcargahor: number;
  descricao: string | null;
  totalMinutosSemana: number;
  totalHorasSemanaFmt: string;
  dias: FuncionarioCargaDia[];
}

export interface FuncionarioPerfilEnriquecido {
  // Dados pessoais (TGFPAR)
  codparc: number;
  nomeparc: string;
  cgcCpf: string | null;
  dtNascimento: string | null;
  telefone: string | null;
  email: string | null;

  // Endereço completo
  endereco: FuncionarioEndereco | null;

  // Papéis no sistema
  papeis: FuncionarioPapeis;

  // Dados de usuário sistema (TSIUSU) se existir
  usuarioSistema: FuncionarioUsuarioSistema | null;

  // Vínculo atual ou mais recente (QUALQUER situação)
  vinculoAtual: FuncionarioVinculoAtual | null;

  // Histórico de vínculos
  historico: FuncionarioHistorico;

  // Carga horária (se tiver codcargahor no vínculo atual)
  cargaHoraria: FuncionarioCargaHoraria | null;
}

/**
 * Row type retornado pela SQL query principal
 * NOTE: temUsuario e totalVinculos são calculados no service (codusu != null e historico.length)
 * NOTE: Endereço completo (logradouro, bairro, cidade, uf) não disponível via API Mother
 *       apenas campos básicos (numend, complemento, cep)
 */
export interface PerfilEnriquecidoRow {
  // Parceiro
  codparc: number;
  nomeparc: string;
  cgcCpf: string | null;
  telefone: string | null;
  email: string | null;

  // Endereço (apenas campos básicos disponíveis via API Mother)
  numend: string | null;
  complemento: string | null;
  cep: string | null;

  // Flags (parceiro)
  cliente: 'S' | 'N';
  fornecedor: 'S' | 'N';

  // Data nascimento (TGFPAR.DTNASC)
  dtNascimento: string | null;

  // Usuario (opcional - se existir, temUsuario = true)
  // NOTE: DTLIMACESSO usado para verificar se usuário está ativo (NULL ou data futura = ativo)
  codusu: number | null;
  nomeusu: string | null;
  emailUsuario: string | null;
  dtLimAcesso: string | null;

  // Vinculo mais recente
  codemp: number | null;
  codfunc: number | null;
  situacao: string | null;
  dtadm: string | null;
  dtdem: string | null;
  salario: number | null;
  coddep: number | null;
  codcargo: number | null;
  codfuncao: number | null;
  codcargahor: number | null;
  cargo: string | null;
  funcao: string | null;
  departamento: string | null;
  empresa: string | null;
}
