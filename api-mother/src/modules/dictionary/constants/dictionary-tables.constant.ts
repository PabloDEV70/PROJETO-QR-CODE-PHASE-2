// Whitelist de tabelas do dicionario de dados Sankhya
export const DICTIONARY_TABLES = [
  'TDDTAB',
  'TDDCAM',
  'TDDOPC',
  'TDDPCO',
  'TDDINS',
  'TDDLIG',
  'TDDLGC',
  'TDDIAC',
  'TDDTABI18N',
  'TDDCAMI18N',
  'TDDOPCI18N',
  'TDDINSI18N',
  'TDDI18N',
  'TRDCON',
  'TRDPCO',
  'TRDFCO',
  'TRDEVE',
  'TRDCONI18N',
];

export const FIELD_TYPES: Record<string, string> = {
  B: 'Blob (binario)',
  C: 'Clob (texto longo)',
  D: 'Data',
  F: 'Float (decimal)',
  I: 'Integer (inteiro)',
  H: 'DateTime (data e hora)',
  S: 'String (texto)',
  T: 'Time (hora)',
};

export const PRESENTATION_TYPES: Record<string, string> = {
  A: 'Arquivo',
  C: 'Checkbox',
  H: 'HTML',
  I: 'Imagem',
  M: 'Multiplos arquivos',
  O: 'Lista de opcoes',
  P: 'Padrao',
  T: 'Caixa de texto',
};
