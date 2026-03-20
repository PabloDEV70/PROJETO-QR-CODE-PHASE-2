export interface DiagnosticoFaixa {
  label: string;
  color: string;
}

export interface ToleranciaItem {
  aplicada: boolean;
  minutos: number;
}

export interface RdoTolerancias {
  almoco: ToleranciaItem;
  banheiro: ToleranciaItem;
  fumar: ToleranciaItem;
}

export interface RdoDiagnostico {
  texto: string;
  faixa: DiagnosticoFaixa;
}
