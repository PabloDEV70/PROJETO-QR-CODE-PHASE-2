export interface AdComadm {
  NUCHAMADO: number;
  DESCRCHAMADO: string | null;
  STATUS: 'P' | 'E' | 'S' | 'A' | 'C' | 'F';
  PRIORIDADE: 'A' | 'M' | 'B' | null;
  TIPOCHAMADO: string | null;
  DHCHAMADO: string | null;
  DHFINCHAM: string | null;
  DHPREVENTREGA: string | null;
  DHVALIDACAO: string | null;
  DHALTER: string | null;
  SOLICITANTE: number | null;
  SOLICITADO: number | null;
  FINALIZADOPOR: number | null;
  VALIDADOPOR: number | null;
  CODUSUALTER: number | null;
  CODPARC: number | null;
  SETOR: string | null;
  NOMEPARC: string | null;
  NOMESOLICITANTE: string | null;
  CODPARCSOLICITANTE: number | null;
  NOMEATRIBUIDO: string | null;
  CODPARCATRIBUIDO: number | null;
  NOMEFINALIZADOR: string | null;
  CODPARCFINALIZADOR: number | null;
  NOMEALTERADOR: string | null;
  NOMEVALIDADOR: string | null;
  TEM_ANEXO: number;
}
