import { saveAs } from 'file-saver';
import type { ExportColumn } from './excel-export';
import { prepareExportData } from './excel-export';

export function exportToCSV(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
): void {
  const BOM = '\uFEFF';
  const SEP = ';';

  const header = columns.map((c) => c.header).join(SEP);
  const prepared = prepareExportData(data, columns);

  const rows = prepared.map((row) =>
    columns.map((col) => {
      const val = row[col.key];

      if (val == null) return '';
      if (typeof val === 'boolean') return val ? 'Sim' : 'Nao';
      if (typeof val === 'number') return String(val).replace('.', ',');

      const str = String(val);
      if (str.includes(SEP) || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(SEP),
  );

  const csv = BOM + [header, ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${filename}.csv`);
}
