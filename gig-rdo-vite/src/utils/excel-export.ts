import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  numFmt?: string;
  transform?: (val: unknown) => unknown;
}

export interface ExcelExportConfig {
  filename: string;
  sheetName?: string;
  columns: ExportColumn[];
  data: Record<string, unknown>[];
  includeFormulas?: boolean;
  creator?: string;
}

export function prepareExportData(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
): Record<string, unknown>[] {
  const hasTx = columns.some((c) => c.transform);
  if (!hasTx) return data;
  return data.map((row) => {
    const out = { ...row };
    for (const col of columns) {
      if (col.transform && col.key in out) {
        out[col.key] = col.transform(out[col.key]);
      }
    }
    return out;
  });
}

function colLetter(index: number): string {
  let result = '';
  let n = index;
  while (n >= 0) {
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

export async function exportToExcel(config: ExcelExportConfig): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = config.creator || 'Sistema GIG';
  workbook.created = new Date();

  const ws = workbook.addWorksheet(
    (config.sheetName || 'Dados').slice(0, 31),
    {
      properties: { tabColor: { argb: 'FF1976D2' } },
      views: [{ state: 'frozen', ySplit: 1 }],
    },
  );

  ws.columns = config.columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 15,
  }));

  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1976D2' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 24;

  const prepared = prepareExportData(config.data, config.columns);
  prepared.forEach((item) => {
    const row = ws.addRow(item);
    config.columns.forEach((col, idx) => {
      const cell = row.getCell(idx + 1);
      if (col.numFmt) cell.numFmt = col.numFmt;
      if (col.numFmt?.includes('#,##0') || col.numFmt?.includes('%')) {
        cell.alignment = { horizontal: 'right' };
      }
    });
  });

  if (config.includeFormulas && config.data.length > 0) {
    const lastRow = ws.lastRow?.number || 1;
    const totalsRow = ws.addRow({});
    totalsRow.font = { bold: true };
    totalsRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE3F2FD' },
    };

    config.columns.forEach((col, idx) => {
      const cell = totalsRow.getCell(idx + 1);
      const colLtr = colLetter(idx);

      if (col.numFmt?.includes('%')) {
        cell.value = { formula: `AVERAGE(${colLtr}2:${colLtr}${lastRow})` };
        cell.numFmt = col.numFmt;
      } else if (col.numFmt?.includes('#,##0') || col.numFmt?.includes('[h]')) {
        cell.value = { formula: `SUM(${colLtr}2:${colLtr}${lastRow})` };
        cell.numFmt = col.numFmt;
      } else if (idx === 0) {
        cell.value = `TOTAL (${config.data.length} registros)`;
      }
    });
  }

  ws.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      };
    });
  });

  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: config.columns.length },
  };

  ws.pageSetup = {
    paperSize: 9,
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `${config.filename}.xlsx`);
}
