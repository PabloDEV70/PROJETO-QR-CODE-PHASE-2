import { OsComercial } from './tgf-vei-os-comercial';
import { OsManutencao } from './tgf-vei-os-manutencao';
import { ContratoVeiculo } from './tgf-vei-contrato';

export interface TgfVeiPerfilCompleto {
  codveiculo: number;
  placa: string;
  marcamodelo: string;
  categoria: string;
  tipo: string;
  fabricante: string;
  capacidade: string;
  anofabric: number | null;
  anomod: number | null;
  chassis: string | null;
  renavam: string | null;
  combustivel: string | null;
  kmacum: number | null;
  ativo: string;
  bloqueado: string;
  codmotorista: number | null;
  motoristaNome: string | null;
  tag: string | null;
  exibeDash: string;
  status: string;
  osComerciais?: OsComercial[];
  osManutencao?: OsManutencao[];
  contratos?: ContratoVeiculo[];
}
