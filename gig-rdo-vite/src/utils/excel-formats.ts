export const ExcelFormats = {
  CURRENCY_BRL: 'R$ #,##0.00;[Red]-R$ #,##0.00',
  PERCENTAGE: '0.00%',
  PERCENTAGE_100: '0"%"',
  DATE_BR: 'dd/mm/yyyy',
  DATETIME_BR: 'dd/mm/yyyy hh:mm',
  INTEGER: '#,##0',
  DECIMAL_2: '#,##0.00',
  HOURS: '[h]:mm',
  TIME: 'hh:mm',
} as const;

export type ExcelFormat = typeof ExcelFormats[keyof typeof ExcelFormats];
