import type { ExportColumn } from './excel-export';
import { prepareExportData } from './excel-export';
import {
  PDF_COLORS,
  drawPdfHeader,
  addPdfFooter,
  formatValuePtBr,
} from './pdf-layout';
import type { PdfHeaderConfig } from './pdf-layout';

export interface PdfExportConfig {
  filename: string;
  columns: ExportColumn[];
  data: Record<string, unknown>[];
  header?: PdfHeaderConfig;
  orientation?: 'portrait' | 'landscape';
}

export interface PdfSheetConfig {
  title: string;
  columns: ExportColumn[];
  data: Record<string, unknown>[];
}

export interface PdfMultiSheetConfig {
  filename: string;
  header?: PdfHeaderConfig;
  orientation?: 'portrait' | 'landscape';
  sheets: PdfSheetConfig[];
}

function buildTableBody(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
): string[][] {
  const prepared = prepareExportData(data, columns);
  return prepared.map((row) =>
    columns.map((col) => formatValuePtBr(row[col.key], col.numFmt)),
  );
}

function buildColumnStyles(
  columns: ExportColumn[],
): Record<number, { halign: 'right' | 'left' | 'center' }> {
  const styles: Record<number, { halign: 'right' | 'left' | 'center' }> = {};
  columns.forEach((col, idx) => {
    if (col.numFmt?.includes('#,##0') || col.numFmt?.includes('%') || col.numFmt?.includes('[h]')) {
      styles[idx] = { halign: 'right' };
    }
  });
  return styles;
}

export async function exportToPDF(config: PdfExportConfig): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = autoTableModule.default;

  const doc = new jsPDF({
    orientation: config.orientation || 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const startY = config.header
    ? drawPdfHeader(doc, config.header)
    : 15;

  const head = [config.columns.map((c) => c.header)];
  const body = buildTableBody(config.data, config.columns);

  autoTable(doc, {
    head,
    body,
    startY,
    theme: 'striped',
    headStyles: {
      fillColor: PDF_COLORS.primary,
      textColor: PDF_COLORS.headerText,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: PDF_COLORS.text,
    },
    alternateRowStyles: {
      fillColor: PDF_COLORS.altRow,
    },
    styles: {
      cellPadding: 2,
      overflow: 'linebreak',
      lineWidth: 0.1,
    },
    columnStyles: buildColumnStyles(config.columns),
    margin: { top: 15, bottom: 18 },
  });

  addPdfFooter(doc);
  doc.save(`${config.filename}.pdf`);
}

export async function exportToPDFMultiSheet(
  config: PdfMultiSheetConfig,
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = autoTableModule.default;

  const doc = new jsPDF({
    orientation: config.orientation || 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  let isFirstSheet = true;

  for (const sheet of config.sheets) {
    if (!isFirstSheet) doc.addPage();
    isFirstSheet = false;

    const sheetHeader: PdfHeaderConfig = {
      title: config.header?.title || sheet.title,
      subtitle: sheet.title !== config.header?.title ? sheet.title : undefined,
      infoPairs: config.header?.infoPairs,
    };

    const startY = drawPdfHeader(doc, sheetHeader);
    const head = [sheet.columns.map((c) => c.header)];
    const body = buildTableBody(sheet.data, sheet.columns);

    autoTable(doc, {
      head,
      body,
      startY,
      theme: 'striped',
      headStyles: {
        fillColor: PDF_COLORS.primary,
        textColor: PDF_COLORS.headerText,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 7,
        textColor: PDF_COLORS.text,
      },
      alternateRowStyles: {
        fillColor: PDF_COLORS.altRow,
      },
      styles: {
        cellPadding: 2,
        overflow: 'linebreak',
        lineWidth: 0.1,
      },
      columnStyles: buildColumnStyles(sheet.columns),
      margin: { top: 15, bottom: 18 },
    });
  }

  addPdfFooter(doc);
  doc.save(`${config.filename}.pdf`);
}
