export interface VeiculoAlerta {
  tipo: string;
  mensagem: string;
  codveiculo: number;
  placa: string;
  marcamodelo: string;
  nuos: number | null;
  dataReferencia: string | null;
  diasAtraso: number | null;
}
