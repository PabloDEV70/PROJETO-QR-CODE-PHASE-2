import { FuncionarioPerfilEnriquecido } from './funcionario-perfil-enriquecido';

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

export interface GestorRow {
  codcencus: number;
  centroResultado: string;
  gestorCodusu: number | null;
  gestorNome: string | null;
  gestorEmail: string | null;
  gestorCelular: string | null;
  gestorCargo: string | null;
  gestorDepartamento: string | null;
}

export interface SalarioRow {
  salBase: number;
  salBruto: number;
  salLiq: number;
  dtPagamento: string | null;
  diasTrabalhados: number;
  referencia: string | null;
  tipFolhaDescricao: string;
}
