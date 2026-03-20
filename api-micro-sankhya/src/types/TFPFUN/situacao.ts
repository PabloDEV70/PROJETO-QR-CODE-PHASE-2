export type SituacaoFuncionario =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9';

export const SITUACAO_LABELS: Record<string, string> = {
  '0': 'Demitido',
  '1': 'Ativo',
  '2': 'Afastado sem remuneração',
  '3': 'Acidente de trabalho',
  '4': 'Serviço militar',
  '5': 'Licença gestante',
  '6': 'Doença superior a 15 dias',
  '7': 'Reservado',
  '8': 'Transferido',
  '9': 'Aposentadoria por invalidez',
};
