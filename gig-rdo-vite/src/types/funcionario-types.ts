export interface FuncionarioCompletoCargaTurno {
  entrada: string;
  saida: string;
  minutos: number;
}

export interface FuncionarioCompletoCargaDia {
  diasem: number;
  diasemLabel: string;
  minutosPrevistos: number;
  folga: boolean;
  turnos?: FuncionarioCompletoCargaTurno[];
}

export interface FuncionarioCompletoCarga {
  codcargahor: number;
  descricao: string | null;
  totalMinutosSemana: number;
  totalHorasSemanaFmt: string;
  dias: FuncionarioCompletoCargaDia[];
}

export interface FuncionarioCompleto {
  codparc: number;
  nomeparc: string;
  cgcCpf: string | null;
  telefone: string | null;
  email: string | null;
  codemp: number;
  codfunc: number;
  situacao: string;
  situacaoLabel: string;
  dtadm: string;
  codcargahor: number | null;
  salario: number | null;
  codcargo: number | null;
  cargo: string | null;
  codfuncao: number | null;
  funcao: string | null;
  coddep: number | null;
  departamento: string | null;
  empresa: string | null;
  cargaHoraria: FuncionarioCompletoCarga | null;
}

export type SituacaoFuncionario =
  | '0' // Demitido
  | '1' // Ativo
  | '2' // Afastado sem remuneracao
  | '3' // Acidente de trabalho
  | '4' // Servico militar
  | '5' // Licenca gestante
  | '6' // Doenca superior a 15 dias
  | '7' // Reservado
  | '8' // Transferido
  | '9'; // Aposentadoria por invalidez

// Tipos para perfil enriquecido (funciona para QUALQUER situacao)
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
  ativo: boolean;
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

export interface FuncionarioPerfilEnriquecido {
  codparc: number;
  nomeparc: string;
  cgcCpf: string | null;
  dtNascimento: string | null;
  telefone: string | null;
  email: string | null;
  endereco: FuncionarioEndereco | null;
  papeis: FuncionarioPapeis;
  usuarioSistema: FuncionarioUsuarioSistema | null;
  vinculoAtual: FuncionarioVinculoAtual | null;
  historico: FuncionarioHistorico;
  cargaHoraria: FuncionarioCompletoCarga | null;
}

// Perfil Super types (novo endpoint com gestor + salario)
export interface GestorInfo {
  codusu: number;
  nome: string;
  email: string | null;
  celular: string | null;
  cargo: string | null;
  departamento: string | null;
}

export interface CentroResultadoInfo {
  codcencus: number;
  descricao: string;
}

export interface SalarioInfo {
  salBase: number;
  salBruto: number;
  salLiq: number;
  dtPagamento: string | null;
  diasTrabalhados: number;
  referencia: string | null;
  tipFolhaDescricao: string;
  percentualLiquido: number | null;
}

export interface FuncionarioPerfilSuper extends FuncionarioPerfilEnriquecido {
  gestor: GestorInfo | null;
  centroResultado: CentroResultadoInfo | null;
  salarioInfo: SalarioInfo | null;
}

// Busca de funcionario
export interface FuncionarioBusca {
  codparc: number;
  nomeparc: string;
  codfunc: number;
  codemp: number;
  cargo: string | null;
  departamento: string | null;
  temFoto: boolean;
}

// Lista de funcionarios (por departamento)
export interface FuncionarioListaItem {
  codparc: number;
  nomeparc: string;
  temFoto: boolean;
  departamento: string | null;
  cargo: string | null;
  cgcCpf: string | null;
  codfunc: number;
  codemp: number;
  situacao: string;
  situacaoLabel: string;
  dtadm: string;
  dtnasc: string | null;
  idade: number | null;
  diasNaEmpresa: number | null;
  empresa: string | null;
  temUsuario: boolean;
  temArmario: boolean;
  cliente: boolean;
  fornecedor: boolean;
}

export interface FuncionarioListaResponse {
  data: FuncionarioListaItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// Resumo de funcionarios (dashboard)
export interface FuncionariosResumoEmpresa {
  codemp: number;
  nome: string | null;
  total: number;
}

export interface FuncionariosResumoDepartamento {
  coddep: number;
  nome: string | null;
  total: number;
}

export interface FuncionariosResumo {
  totalAtivos: number;
  totalDemitidos: number;
  totalAfastados: number;
  totalTransferidos: number;
  totalComUsuario: number;
  totalComFoto: number;
  total: number;
  porEmpresa: FuncionariosResumoEmpresa[];
  porDepartamento: FuncionariosResumoDepartamento[];
}

// Filtros opcoes (dropdowns)
export interface OpcaoFiltro {
  codigo: number;
  nome: string;
}

export interface FiltrosOpcoes {
  empresas: OpcaoFiltro[];
  departamentos: OpcaoFiltro[];
  cargos: OpcaoFiltro[];
  funcoes: OpcaoFiltro[];
  centrosResultado: OpcaoFiltro[];
}

// Params tipados para listar funcionarios
export interface ListarFuncionariosParams {
  situacao?: string;
  codemp?: number;
  coddep?: number;
  codcargo?: number;
  codfuncao?: number;
  termo?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
  comUsuario?: boolean;
  temFoto?: boolean;
}

// Hora extra
export interface HoraExtraApontamento {
  codrdo: number;
  rdomotivocod: number;
  motivo: string;
  hrini: string;
  hrfim: string;
  minutos: number;
}

export interface HoraExtraDia {
  data: string;
  diasem: number;
  minutosPrevistos: number;
  minutosApontados: number;
  minutosExtra: number;
  apontamentos: HoraExtraApontamento[];
}

export interface HoraExtraResumo {
  totalMinutosPrevistos: number;
  totalMinutosApontados: number;
  totalMinutosExtra: number;
}

export interface HoraExtraVinculo {
  codemp: number;
  codfunc: number;
  codcargahor: number;
  descricaoCarga: string | null;
}

export interface HoraExtraResponse {
  resumo: HoraExtraResumo;
  dias: HoraExtraDia[];
  vinculo: HoraExtraVinculo | null;
}

// Card publico (pagina sem autenticacao)
export interface FuncionarioCardPublico {
  codemp: number;
  codfunc: number;
  nome: string;
  cargo: string | null;
  funcao: string | null;
  departamento: string | null;
  empresa: string | null;
  situacao: string;
  situacaoLabel: string;
  dtadm: string | null;
}
