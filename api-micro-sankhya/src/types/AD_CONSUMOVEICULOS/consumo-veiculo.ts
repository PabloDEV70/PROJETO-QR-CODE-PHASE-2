export interface ConsumoVeiculo {
  ID: number;
  CODVEICULO: number;
  MODELO: string | null;
  FAMILIA: string | null;
  ANO: number | null;
  MARCA: string | null;
  NUMEROFROTA: string | null;
  TIPOCOMBUSTIVEL: string | null;
  ULTIMAKMH: number | null;
  KMRODADOS: number | null;
  HORASTRABALHADAS: number | null;
  VALORMEDIOLITRO: number | null;
  KMPORLITRO: number | null;
  LITROSPORHORA: number | null;
  TOTALTRANSACAO: number | null;
  LITROS: number | null;
  DATA_ABASTECIMENTO: string | null;
  PLACA_TAG: string | null;
  MOTORISTA: string | null;
  DT_UPDATE: string | null;
}
